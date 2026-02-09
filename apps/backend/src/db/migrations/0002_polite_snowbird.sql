CREATE TABLE "joke_set_items" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"set_id" text,
	"item_type" text,
	"joke_id" text,
	"content" text,
	"position" integer,
	"created_at" bigint,
	"updated_at" bigint,
	"server_created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "joke_sets" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"title" text,
	"description" text,
	"duration" integer,
	"place" text,
	"status" text,
	"created_at" bigint,
	"updated_at" bigint,
	"server_created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "jokes" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"content_html" text,
	"content_text" text,
	"status" text,
	"created_at" bigint,
	"updated_at" bigint,
	"draft_updated_at" bigint,
	"tags" text,
	"server_created_at" timestamp DEFAULT now() NOT NULL,
	"last_modified" timestamp DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
ALTER TABLE "joke_set_items" ADD CONSTRAINT "joke_set_items_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "joke_sets" ADD CONSTRAINT "joke_sets_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "jokes" ADD CONSTRAINT "jokes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;