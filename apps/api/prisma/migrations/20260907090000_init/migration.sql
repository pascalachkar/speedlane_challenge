CREATE TYPE "UserRole" AS ENUM ('MEMBER', 'ADMIN');

CREATE TABLE "users" (
  "id" UUID NOT NULL,
  "email" VARCHAR(320) NOT NULL,
  "password_hash" TEXT NOT NULL,
  "display_name" VARCHAR(100) NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'MEMBER',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "auth_sessions" (
  "id" UUID NOT NULL,
  "user_id" UUID NOT NULL,
  "refresh_token_hash" TEXT NOT NULL,
  "expires_at" TIMESTAMPTZ(3) NOT NULL,
  "revoked_at" TIMESTAMPTZ(3),
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "auth_sessions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "movies" (
  "id" UUID NOT NULL,
  "slug" VARCHAR(180) NOT NULL,
  "title" VARCHAR(200) NOT NULL,
  "synopsis" TEXT NOT NULL,
  "release_date" DATE NOT NULL,
  "runtime_minutes" SMALLINT NOT NULL,
  "content_rating" VARCHAR(20),
  "poster_url" TEXT NOT NULL,
  "backdrop_url" TEXT,
  "average_rating" DECIMAL(3,1) NOT NULL,
  "created_by_id" UUID,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "movies_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "movies_runtime_minutes_check" CHECK ("runtime_minutes" > 0),
  CONSTRAINT "movies_average_rating_check" CHECK ("average_rating" BETWEEN 0 AND 10)
);

CREATE TABLE "directors" (
  "id" UUID NOT NULL,
  "name" VARCHAR(150) NOT NULL,
  "slug" VARCHAR(180) NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "directors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "movie_directors" (
  "movie_id" UUID NOT NULL,
  "director_id" UUID NOT NULL,
  "credit_order" SMALLINT NOT NULL DEFAULT 0,
  CONSTRAINT "movie_directors_pkey" PRIMARY KEY ("movie_id", "director_id"),
  CONSTRAINT "movie_directors_credit_order_check" CHECK ("credit_order" >= 0)
);

CREATE TABLE "genres" (
  "id" UUID NOT NULL,
  "name" VARCHAR(60) NOT NULL,
  "slug" VARCHAR(70) NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "genres_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "movie_genres" (
  "movie_id" UUID NOT NULL,
  "genre_id" UUID NOT NULL,
  CONSTRAINT "movie_genres_pkey" PRIMARY KEY ("movie_id", "genre_id")
);

CREATE TABLE "watchlist_items" (
  "user_id" UUID NOT NULL,
  "movie_id" UUID NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "watchlist_items_pkey" PRIMARY KEY ("user_id", "movie_id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE UNIQUE INDEX "auth_sessions_refresh_token_hash_key" ON "auth_sessions"("refresh_token_hash");
CREATE INDEX "auth_sessions_user_id_expires_at_idx" ON "auth_sessions"("user_id", "expires_at");
CREATE UNIQUE INDEX "movies_slug_key" ON "movies"("slug");
CREATE INDEX "movies_title_idx" ON "movies"("title");
CREATE INDEX "movies_release_date_idx" ON "movies"("release_date");
CREATE INDEX "movies_average_rating_idx" ON "movies"("average_rating");
CREATE UNIQUE INDEX "directors_slug_key" ON "directors"("slug");
CREATE INDEX "directors_name_idx" ON "directors"("name");
CREATE INDEX "movie_directors_director_id_movie_id_idx" ON "movie_directors"("director_id", "movie_id");
CREATE UNIQUE INDEX "genres_name_key" ON "genres"("name");
CREATE UNIQUE INDEX "genres_slug_key" ON "genres"("slug");
CREATE INDEX "movie_genres_genre_id_movie_id_idx" ON "movie_genres"("genre_id", "movie_id");
CREATE INDEX "watchlist_items_user_id_created_at_idx" ON "watchlist_items"("user_id", "created_at");

ALTER TABLE "auth_sessions" ADD CONSTRAINT "auth_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "movies" ADD CONSTRAINT "movies_created_by_id_fkey" FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "movie_directors" ADD CONSTRAINT "movie_directors_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "movie_directors" ADD CONSTRAINT "movie_directors_director_id_fkey" FOREIGN KEY ("director_id") REFERENCES "directors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "movie_genres" ADD CONSTRAINT "movie_genres_genre_id_fkey" FOREIGN KEY ("genre_id") REFERENCES "genres"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_movie_id_fkey" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
