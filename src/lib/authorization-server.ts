import { randomBytes } from "node:crypto";
import { AuthorizationServer } from "@jmondi/oauth2-server";
import type { User } from "@prisma/client";
import prisma from "./prisma";

const generateRandomToken = (size = 32) =>
  new Promise<string>((resolve, reject) => {
    randomBytes(size, (err, buf) => {
      if (err) reject(err);
      else resolve(buf.toString("hex"));
    });
  });

const authorizationServer = new AuthorizationServer(
  {
    getByIdentifier: (clientId) =>
      prisma.client.findUniqueOrThrow({
        where: { id: clientId },
        select: {
          id: true,
          name: true,
          secret: true,
          redirectUris: true,
          allowedGrants: true,
          scopes: true,
        },
      }),
    isClientValid: (grantType, client, clientSecret) =>
      Promise.resolve(
        client.allowedGrants.includes(grantType) &&
          clientSecret === client.secret,
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
          userId: user?.id as string | undefined,
          scopes: { connect: scopes },
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
      prisma.token.findFirstOrThrow({
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
          user: true,
          scopes: true,
        },
      }),
  },
  {
    getAllByIdentifiers: (scopeNames) =>
      prisma.scope.findMany({ where: { name: { in: scopeNames } } }),
    finalize: (scopes) => Promise.resolve(scopes),
  },
  "secret-key",
);
export default authorizationServer;

authorizationServer.enableGrantType({
  grant: "authorization_code",
  userRepository: {
    getUserByCredentials: async (identifier: string) =>
      (await prisma.user.findUnique({ where: { id: identifier } })) ??
      undefined,
  },
  authCodeRepository: {
    getByIdentifier: (authCodeCode) =>
      prisma.authCode.findUniqueOrThrow({
        where: { code: authCodeCode },
        select: {
          code: true,
          redirectUri: true,
          codeChallenge: true,
          codeChallengeMethod: true,
          expiresAt: true,
          user: true,
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
      }),
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
          user: { connect: user as User | undefined },
          client: { connect: { id: client.id } },
          scopes: { connect: scopes },
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
