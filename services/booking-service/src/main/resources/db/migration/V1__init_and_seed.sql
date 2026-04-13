CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL,
    tenant_id UUID NOT NULL,
    owner_id UUID NOT NULL,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    guests_count INT NOT NULL DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookings_listing_id ON bookings(listing_id);
CREATE INDEX idx_bookings_tenant_id ON bookings(tenant_id);
CREATE INDEX idx_bookings_owner_id ON bookings(owner_id);
CREATE INDEX idx_bookings_status ON bookings(status);

INSERT INTO bookings (id, listing_id, tenant_id, owner_id, check_in_date, check_out_date, guests_count, total_price, status, message, created_at, updated_at) VALUES
('11111111-aaaa-4bbb-cccc-dddddddddd01', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', '4a847537-998b-4632-acce-3b873e455608', 'e306e358-43af-4146-bc41-c5352d34deda', '2026-02-10', '2026-02-15', 2, 725.00, 'COMPLETED', 'Bonjour Marie, nous serions ravis de sejourner dans votre appartement pour un week-end prolonge a Paris !', '2026-02-01 10:00:00', '2026-02-15 12:00:00'),
('11111111-aaaa-4bbb-cccc-dddddddddd02', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'd2445a96-8c32-4c13-9bc2-3b7320339d31', '0f6e1318-3c69-4c01-8e60-76cb240e52ba', '2026-02-20', '2026-02-27', 6, 1750.00, 'COMPLETED', 'Bonjour Sophie, votre villa est magnifique ! Nous serons un groupe de 6 amis pour une semaine de vacances.', '2026-02-10 14:30:00', '2026-02-27 12:00:00'),
('11111111-aaaa-4bbb-cccc-dddddddddd03', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'ec7a76f9-7a66-415a-9199-c8054be7c2a0', '0f6e1318-3c69-4c01-8e60-76cb240e52ba', '2026-03-01', '2026-03-05', 3, 1000.00, 'COMPLETED', 'Bonjour Sophie, nous aimerions profiter de votre villa pour un court sejour debut mars !', '2026-02-20 11:00:00', '2026-03-05 12:00:00'),
('11111111-aaaa-4bbb-cccc-dddddddddd04', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', '10317861-9bdf-42ed-88bb-5b37fba3abd0', 'e306e358-43af-4146-bc41-c5352d34deda', '2026-03-05', '2026-03-09', 2, 580.00, 'COMPLETED', 'Bonjour Marie, je visite Paris pour la premiere fois et votre appartement semble ideal.', '2026-02-25 09:00:00', '2026-03-09 12:00:00'),
('11111111-aaaa-4bbb-cccc-dddddddddd05', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', '27cfc137-3ef7-4937-b18b-74c8b3cc557c', 'ec7a76f9-7a66-415a-9199-c8054be7c2a0', '2026-03-10', '2026-03-14', 2, 480.00, 'COMPLETED', 'Bonjour Lucas, votre maison dans les Chartrons a l air charmante !', '2026-03-01 15:00:00', '2026-03-14 12:00:00'),
('11111111-aaaa-4bbb-cccc-dddddddddd06', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'c2b22472-32f3-4e1f-965d-28bbe3c407f8', '4a847537-998b-4632-acce-3b873e455608', '2026-03-15', '2026-03-18', 1, 195.00, 'COMPLETED', 'Salut Jean, je suis en deplacement a Lyon et votre studio me plait beaucoup.', '2026-03-05 10:30:00', '2026-03-18 12:00:00'),
('11111111-aaaa-4bbb-cccc-dddddddddd07', 'e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 'e306e358-43af-4146-bc41-c5352d34deda', 'd2445a96-8c32-4c13-9bc2-3b7320339d31', '2026-03-20', '2026-03-24', 2, 460.00, 'COMPLETED', 'Bonjour Emma, votre chambre a Strasbourg semble tres bien placee pour visiter la ville.', '2026-03-10 08:00:00', '2026-03-24 12:00:00'),
('11111111-aaaa-4bbb-cccc-dddddddddd09', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'c2b22472-32f3-4e1f-965d-28bbe3c407f8', 'e306e358-43af-4146-bc41-c5352d34deda', '2026-04-01', '2026-04-04', 2, 435.00, 'COMPLETED', 'Bonjour Marie, je serai a Paris pour un salon professionnel debut avril.', '2026-03-20 16:00:00', '2026-04-04 12:00:00'),
('11111111-aaaa-4bbb-cccc-dddddddddd10', 'd4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', '0f6e1318-3c69-4c01-8e60-76cb240e52ba', 'ec7a76f9-7a66-415a-9199-c8054be7c2a0', '2026-04-05', '2026-04-08', 3, 360.00, 'COMPLETED', 'Bonjour Lucas, je descends a Bordeaux pour les vacances de printemps avec mes enfants.', '2026-03-25 11:00:00', '2026-04-08 12:00:00'),
('11111111-aaaa-4bbb-cccc-dddddddddd11', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'ec7a76f9-7a66-415a-9199-c8054be7c2a0', 'e306e358-43af-4146-bc41-c5352d34deda', '2026-05-01', '2026-05-05', 2, 580.00, 'PENDING', 'Bonjour, je cherche un logement pour un petit sejour a Paris debut mai.', '2026-04-10 09:15:00', '2026-04-10 09:15:00'),
('11111111-aaaa-4bbb-cccc-dddddddddd12', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'd2445a96-8c32-4c13-9bc2-3b7320339d31', '4a847537-998b-4632-acce-3b873e455608', '2026-04-25', '2026-04-28', 1, 195.00, 'CONFIRMED', 'Salut Jean, je visite Lyon pour un week-end, votre studio a l air parfait !', '2026-04-05 16:00:00', '2026-04-06 08:30:00'),
('11111111-aaaa-4bbb-cccc-dddddddddd13', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', '27cfc137-3ef7-4937-b18b-74c8b3cc557c', '0f6e1318-3c69-4c01-8e60-76cb240e52ba', '2026-05-10', '2026-05-17', 4, 1750.00, 'PENDING', 'Bonjour Sophie, nous organisons un sejour entre amis a Nice mi-mai.', '2026-04-12 10:00:00', '2026-04-12 10:00:00');
