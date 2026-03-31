CREATE TABLE "accounts" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"access_token_expires_at" timestamp,
	"refresh_token_expires_at" timestamp,
	"password" text,
	"scope" text,
	"id_token" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bits" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"content" text,
	"status" text,
	"tags_json" text,
	"premise_id" text,
	"setlist_ids_json" text,
	"created_at" bigint,
	"updated_at" bigint,
	"server_created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"content" text,
	"created_at" bigint,
	"updated_at" bigint,
	"server_created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "premises" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"content" text,
	"status" text,
	"attitude" text,
	"tags_json" text,
	"bit_ids_json" text,
	"source_note_id" text,
	"created_at" bigint,
	"updated_at" bigint,
	"server_created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"token" text NOT NULL,
	"impersonated_by" text,
	"ip_address" text,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "setlists" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"description" text,
	"items_json" text,
	"tags_json" text,
	"created_at" bigint,
	"updated_at" bigint,
	"server_created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"banned" boolean DEFAULT false NOT NULL,
	"ban_reason" text,
	"ban_expires" timestamp,
	"image" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bits" ADD CONSTRAINT "bits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "premises" ADD CONSTRAINT "premises_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "setlists" ADD CONSTRAINT "setlists_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "bits_user_sync_idx" ON "bits" USING btree ("user_id","is_deleted","last_modified");--> statement-breakpoint
CREATE INDEX "notes_user_sync_idx" ON "notes" USING btree ("user_id","is_deleted","last_modified");--> statement-breakpoint
CREATE INDEX "premises_user_sync_idx" ON "premises" USING btree ("user_id","is_deleted","last_modified");--> statement-breakpoint
CREATE INDEX "setlists_user_sync_idx" ON "setlists" USING btree ("user_id","is_deleted","last_modified");