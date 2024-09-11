CREATE  TABLE public.t_user (
  id serial NOT NULL,
  username character varying(255) NOT NULL,
  email character varying(255) NOT NULL,
  password character varying(255) NOT NULL,
  role character varying(255) NOT NULL,
  CONSTRAINT user_pkey PRIMARY KEY (id)
) TABLESPACE pg_default;