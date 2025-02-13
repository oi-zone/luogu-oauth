import { randomBytes } from "node:crypto";
import {
  AuthorizationServer,
  OAuthRequest,
  OAuthScope,
} from "@jmondi/oauth2-server";
import { Scope, type Prisma } from "@prisma/client";
import { SECRET_KEY } from "./constants";
import prisma from "./prisma";
import type { NextRequest } from "next/server";

export const requestFromNext = async (request: NextRequest) =>
  new OAuthRequest({
    query: Object.fromEntries(request.nextUrl.searchParams),
    body: await request.text().then((body) => {
      if (request.headers.get("content-type") === "application/json")
        return JSON.parse(body) as Record<string, string>;
      return Object.fromEntries(new URLSearchParams(body));
    }),
    headers: request.headers,
  });

const generateRandomToken = (size = 32) =>
  new Promise<string>((resolve, reject) => {
    randomBytes(size, (err, buf) => {
      if (err) reject(err);
      else resolve(buf.toString("hex"));
    });
  });

const convert2PrismaScopes = (scopes: OAuthScope[]) =>
  scopes.map(({ name }) => name as Scope);
const convert2OAuthScopes = (scopes: Scope[]): OAuthScope[] =>
  scopes.map((scope) => ({ name: scope }));

// 这根本没法维护了，ts-oauth2-server 设计有问题
const convertShit = <
  T extends typeof prisma.token | typeof prisma.authCode,
  D,
>({
  userId,
  scopes,
  client: { scopes: innerScopes, ...client },
  ...data
}: Prisma.Result<
  T,
  {
    select: {
      scopes: true;
      userId: true;
      client: {
        select: {
          id: true;
          name: true;
          secret: true;
          redirectUris: true;
          allowedGrants: true;
          scopes: true;
        };
      };
    };
  },
  "findFirstOrThrow"
> &
  D) => ({
  user: { id: userId },
  scopes: scopes.map((scope) => ({ name: scope })),
  client: {
    scopes: innerScopes.map((scope) => ({ name: scope })),
    ...client,
  },
  ...data,
});

const authorizationServer = new AuthorizationServer(
  {
    getByIdentifier: (clientId) =>
      prisma.client
        .findUniqueOrThrow({
          where: { id: clientId },
          select: {
            id: true,
            name: true,
            secret: true,
            redirectUris: true,
            allowedGrants: true,
            scopes: true,
          },
        })
        .then(({ scopes, ...data }) => ({
          scopes: convert2OAuthScopes(scopes),
          ...data,
        })),
    isClientValid: (grantType, client, clientSecret) =>
      Promise.resolve(
        client.allowedGrants.includes(grantType) &&
          clientSecret === (client.secret ?? undefined),
      ),
  },
  {
    issueToken: async (client, scopes, user) => ({
      accessToken: await generateRandomToken(),
      accessTokenExpiresAt: new Date(),
      client,
      user,
      scopes,
    }),
    async persist({ client, user, scopes, ...accessToken }) {
      await prisma.token.create({
        data: {
          ...accessToken,
          clientId: client.id,
          userId: user?.id as number,
          scopes: convert2PrismaScopes(scopes),
        },
      });
    },
    issueRefreshToken: (accessToken) => Promise.resolve(accessToken),
    async revoke(accessToken) {
      await prisma.token.update({
        where: { accessToken: accessToken.accessToken },
        data: { revoked: true },
      });
    },
    isRefreshTokenRevoked: (refreshToken) =>
      prisma.token
        .findUniqueOrThrow({
          where: { accessToken: refreshToken.accessToken },
          select: { revoked: true },
        })
        .then(({ revoked }) => revoked),
    getByRefreshToken: (refreshTokenToken) =>
      prisma.token
        .findFirstOrThrow({
          where: { refreshToken: refreshTokenToken },
          select: {
            accessToken: true,
            accessTokenExpiresAt: true,
            refreshToken: true,
            refreshTokenExpiresAt: true,
            client: {
              select: {
                id: true,
                name: true,
                secret: true,
                redirectUris: true,
                allowedGrants: true,
                scopes: true,
              },
            },
            userId: true,
            scopes: true,
          },
        })
        .then(convertShit),
  },
  {
    getAllByIdentifiers: (scopeNames) =>
      Promise.resolve(
        convert2OAuthScopes(
          scopeNames.filter((scope) =>
            Object.values(Scope).includes(scope as Scope),
          ) as Scope[],
        ),
      ),
    async finalize(scopes, identifier, client, user_id: number) {
      if (
        await prisma.luoguSession.findFirst({
          where: { uid: user_id, valid: true },
          select: {},
        })
      )
        return scopes;
      // 用户无有效会话
      return scopes.filter(({ name }) => name === Scope.user_info);
    },
  },
  SECRET_KEY,
);
export default authorizationServer;

authorizationServer.enableGrantType({
  grant: "authorization_code",
  userRepository: {
    getUserByCredentials: (identifier: number) =>
      prisma.luoguUser
        .findUnique({ where: { uid: identifier } })
        .then((user) => (user ? { id: user.uid } : undefined)),
  },
  authCodeRepository: {
    getByIdentifier: (authCodeCode) =>
      prisma.authCode
        .findUniqueOrThrow({
          where: { code: authCodeCode },
          select: {
            code: true,
            redirectUri: true,
            codeChallenge: true,
            codeChallengeMethod: true,
            expiresAt: true,
            userId: true,
            client: {
              select: {
                id: true,
                name: true,
                secret: true,
                redirectUris: true,
                allowedGrants: true,
                scopes: true,
              },
            },
            scopes: true,
          },
        })
        .then(convertShit),
    issueAuthCode: async (client, user, scopes) => ({
      code: await generateRandomToken(),
      expiresAt: undefined as never,
      user,
      client,
      scopes,
    }),
    async persist({ user, client, scopes, ...authCode }) {
      await prisma.authCode.create({
        data: {
          ...authCode,
          user: { connect: { uid: user?.id as number } },
          client: { connect: { id: client.id } },
          scopes: convert2PrismaScopes(scopes),
        },
      });
    },
    isRevoked: (authCodeCode) =>
      prisma.authCode
        .findUniqueOrThrow({
          where: { code: authCodeCode },
          select: { revoked: true },
        })
        .then(({ revoked }) => revoked),
    async revoke(authCodeCode) {
      await prisma.authCode.update({
        where: { code: authCodeCode },
        data: { revoked: true },
      });
    },
  },
});
