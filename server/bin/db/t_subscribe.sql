CREATE  TABLE public.subscribe (
  id serial NOT NULL,
  user_id character varying(255) NOT NULL,
  allow_ips text NOT NULL,
  code character varying(255) NOT NULL,
  created_at timestamp without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp without time zone NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT PRIMARY_KEY PRIMARY KEY (id)
) TABLESPACE pg_default;

