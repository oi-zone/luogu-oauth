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
