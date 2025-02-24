package app

import (
	"context"
	"errors"
	"time"

	"github.com/wxh06/luogu-oauth/internal/db"
)

func (app app) getSession(ctx context.Context, accessToken string) (*db.LuoguSessionModel, error) {
	token, err := app.client.Token.
		FindUnique(db.Token.AccessToken.Equals(accessToken)).
		Select(db.Token.AccessTokenExpiresAt.Field(), db.Token.Revoked.Field()).
		With(
			db.Token.User.Fetch().Select().With(
				db.LuoguUser.Sessions.
					Fetch(db.LuoguSession.Valid.Equals(true)).
					Select(db.LuoguSession.UID.Field(), db.LuoguSession.ClientID.Field()).
					Take(1),
			),
		).
		Exec(ctx)
	if errors.Is(err, db.ErrNotFound) || token.Revoked || token.AccessTokenExpiresAt.Before(time.Now()) {
		return nil, errors.New("Unauthorized")
	}
	if err != nil {
		return nil, err
	}
	return &token.User().Sessions()[0], nil
}

func (app app) updateSessionValidity(ctx context.Context, uid int, clientId string, valid bool) (err error) {
	session := app.client.LuoguSession.FindMany(
		db.LuoguSession.ClientID.Equals(clientId),
		db.LuoguSession.UID.Equals(uid),
	)
	if valid {
		_, err = session.Update(db.LuoguSession.LastUsedAt.Set(time.Now())).Exec(ctx)
	} else {
		_, err = session.Update(db.LuoguSession.Valid.Set(false)).Exec(ctx)
	}
	return
}
