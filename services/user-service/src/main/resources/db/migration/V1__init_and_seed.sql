CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    keycloak_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    avatar_url VARCHAR(500),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_users_keycloak_id ON users(keycloak_id);
CREATE INDEX idx_users_email ON users(email);

INSERT INTO users (id, keycloak_id, email, first_name, last_name, phone, created_at, updated_at) VALUES
    ('f47ac10b-58cc-4372-a567-0e02b2c3d479', 'e306e358-43af-4146-bc41-c5352d34deda', 'marie.dupont@gmail.com', 'Marie', 'Dupont', '+33612345678', NOW(), NOW()),
    ('a3bb189e-8bf9-3888-9912-ace4e6543002', '4a847537-998b-4632-acce-3b873e455608', 'jean.martin@outlook.fr', 'Jean', 'Martin', '+33698765432', NOW(), NOW()),
    ('b5f7d128-7a12-4e6c-bf83-9c1a5d73e428', '0f6e1318-3c69-4c01-8e60-76cb240e52ba', 'sophie.bernard@free.fr', 'Sophie', 'Bernard', '+33677891234', NOW(), NOW()),
    ('c83e2c14-5b9a-4d3f-8a71-6e4f9b2d0c85', 'ec7a76f9-7a66-415a-9199-c8054be7c2a0', 'lucas.moreau@laposte.net', 'Lucas', 'Moreau', '+33654321987', NOW(), NOW()),
    ('d92f4a76-1e83-4b5c-9d02-7f6a8e3c1b94', 'd2445a96-8c32-4c13-9bc2-3b7320339d31', 'emma.petit@yahoo.fr', 'Emma', 'Petit', '+33643218765', NOW(), NOW()),
    ('e1a2b3c4-d5e6-4f7a-8b9c-0d1e2f3a4b5c', '10317861-9bdf-42ed-88bb-5b37fba3abd0', 'pierre.leroy@gmail.com', 'Pierre', 'Leroy', '+33661234567', NOW(), NOW()),
    ('f2b3c4d5-e6f7-4a8b-9c0d-1e2f3a4b5c6d', '27cfc137-3ef7-4937-b18b-74c8b3cc557c', 'claire.dubois@outlook.fr', 'Claire', 'Dubois', '+33672345678', NOW(), NOW()),
    ('a3c4d5e6-f7a8-4b9c-0d1e-2f3a4b5c6d7e', 'c2b22472-32f3-4e1f-965d-28bbe3c407f8', 'thomas.garcia@free.fr', 'Thomas', 'Garcia', '+33683456789', NOW(), NOW());
