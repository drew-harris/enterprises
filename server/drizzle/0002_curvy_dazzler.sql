ALTER TABLE "deployments" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "deployments" ADD CONSTRAINT "deployments_id_unique" UNIQUE("id");