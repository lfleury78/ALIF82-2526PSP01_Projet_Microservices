CREATE TABLE IF NOT EXISTS listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    property_type VARCHAR(50) NOT NULL,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    zip_code VARCHAR(20),
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    price_per_night DECIMAL(10, 2) NOT NULL,
    max_guests INT NOT NULL DEFAULT 1,
    bedrooms INT NOT NULL DEFAULT 1,
    bathrooms INT NOT NULL DEFAULT 1,
    surface_area DECIMAL(8, 2),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS listing_amenities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    amenity VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS listing_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    sort_order INT NOT NULL DEFAULT 0
);

CREATE INDEX idx_listings_owner_id ON listings(owner_id);
CREATE INDEX idx_listings_city ON listings(city);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_price ON listings(price_per_night);
CREATE INDEX idx_listings_property_type ON listings(property_type);

INSERT INTO listings (id, owner_id, title, description, property_type, address, city, country, zip_code, latitude, longitude, price_per_night, max_guests, bedrooms, bathrooms, surface_area, status)
VALUES ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'e306e358-43af-4146-bc41-c5352d34deda',
    'Appartement cosy au coeur du Marais', 'Charmant appartement de 45m2 situe en plein coeur du Marais, a deux pas de la Place des Vosges. Entierement renove avec gout, il dispose d''un sejour lumineux, d''une cuisine equipee et d''une chambre confortable.',
    'APARTMENT', '12 Rue des Francs-Bourgeois', 'Paris', 'France', '75004', 48.8566, 2.3622, 145.00, 3, 1, 1, 45.00, 'ACTIVE');

INSERT INTO listings (id, owner_id, title, description, property_type, address, city, country, zip_code, latitude, longitude, price_per_night, max_guests, bedrooms, bathrooms, surface_area, status)
VALUES ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', '4a847537-998b-4632-acce-3b873e455608',
    'Studio moderne a la Presqu''ile de Lyon', 'Studio entierement meuble et equipe au coeur de la Presqu''ile, entre Bellecour et les Terreaux. Parfait pour les voyageurs en solo ou en couple.',
    'STUDIO', '8 Rue de la Republique', 'Lyon', 'France', '69002', 45.7640, 4.8357, 65.00, 2, 0, 1, 28.00, 'ACTIVE');

INSERT INTO listings (id, owner_id, title, description, property_type, address, city, country, zip_code, latitude, longitude, price_per_night, max_guests, bedrooms, bathrooms, surface_area, status)
VALUES ('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', '0f6e1318-3c69-4c01-8e60-76cb240e52ba',
    'Villa avec piscine sur les collines de Nice', 'Magnifique villa provencale de 180m2 avec piscine privee et jardin paysager. Quatre chambres spacieuses, trois salles de bain, grande terrasse avec vue panoramique sur la Baie des Anges.',
    'VILLA', '24 Chemin des Collines', 'Nice', 'France', '06100', 43.7102, 7.2620, 250.00, 8, 4, 3, 180.00, 'ACTIVE');

INSERT INTO listings (id, owner_id, title, description, property_type, address, city, country, zip_code, latitude, longitude, price_per_night, max_guests, bedrooms, bathrooms, surface_area, status)
VALUES ('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'ec7a76f9-7a66-415a-9199-c8054be7c2a0',
    'Maison de charme dans les Chartrons', 'Belle echoppe bordelaise renovee dans le quartier branche des Chartrons. Deux chambres avec parquet ancien, cuisine ouverte sur un petit jardin privatif.',
    'HOUSE', '15 Rue Notre-Dame', 'Bordeaux', 'France', '33000', 44.8510, -0.5692, 120.00, 5, 2, 1, 85.00, 'ACTIVE');

INSERT INTO listings (id, owner_id, title, description, property_type, address, city, country, zip_code, latitude, longitude, price_per_night, max_guests, bedrooms, bathrooms, surface_area, status)
VALUES ('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 'd2445a96-8c32-4c13-9bc2-3b7320339d31',
    'Chambre privee dans la Petite France', 'Grande chambre privee dans une maison a colombages typique du quartier de la Petite France. Salle de bain partagee, acces a la cuisine commune.',
    'ROOM', '5 Rue du Bain-aux-Plantes', 'Strasbourg', 'France', '67000', 48.5800, 7.7410, 42.00, 1, 1, 1, 18.00, 'ACTIVE');

INSERT INTO listings (id, owner_id, title, description, property_type, address, city, country, zip_code, latitude, longitude, price_per_night, max_guests, bedrooms, bathrooms, surface_area, status)
VALUES ('a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', '4a847537-998b-4632-acce-3b873e455608',
    'Studio artistique a Montmartre', 'Petit studio plein de caractere au pied de la Butte Montmartre. Deco vintage et soignee, coin nuit avec lit double, kitchenette equipee.',
    'STUDIO', '18 Rue Lepic', 'Paris', 'France', '75018', 48.8847, 2.3334, 85.00, 2, 0, 1, 22.00, 'ACTIVE');

INSERT INTO listings (id, owner_id, title, description, property_type, address, city, country, zip_code, latitude, longitude, price_per_night, max_guests, bedrooms, bathrooms, surface_area, status)
VALUES ('b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', '0f6e1318-3c69-4c01-8e60-76cb240e52ba',
    'Maison familiale avec jardin a Toulouse', 'Agreable maison de ville avec jardin clos, ideale pour les familles. Trois chambres, deux salles de bain, salon avec cheminee.',
    'HOUSE', '7 Rue des Jardins', 'Toulouse', 'France', '31400', 43.6047, 1.4442, 110.00, 6, 3, 2, 120.00, 'ACTIVE');

INSERT INTO listings (id, owner_id, title, description, property_type, address, city, country, zip_code, latitude, longitude, price_per_night, max_guests, bedrooms, bathrooms, surface_area, status)
VALUES ('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'ec7a76f9-7a66-415a-9199-c8054be7c2a0',
    'Appartement de luxe Promenade des Anglais', 'Appartement haut de gamme de 110m2 sur la celebre Promenade des Anglais. Deux chambres elegamment decorees, grand salon avec baies vitrees face a la mer.',
    'APARTMENT', '65 Promenade des Anglais', 'Nice', 'France', '06000', 43.6953, 7.2651, 210.00, 4, 2, 2, 110.00, 'ACTIVE');

INSERT INTO listings (id, owner_id, title, description, property_type, address, city, country, zip_code, latitude, longitude, price_per_night, max_guests, bedrooms, bathrooms, surface_area, status)
VALUES ('d0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a', 'd2445a96-8c32-4c13-9bc2-3b7320339d31',
    'Chambre cosy dans appartement partage - Vieux Lyon', 'Chambre meublee dans un grand appartement partage au coeur du Vieux Lyon, classe au patrimoine mondial de l''UNESCO.',
    'ROOM', '3 Rue Saint-Jean', 'Lyon', 'France', '69005', 45.7631, 4.8267, 40.00, 1, 1, 1, 14.00, 'ACTIVE');

INSERT INTO listings (id, owner_id, title, description, property_type, address, city, country, zip_code, latitude, longitude, price_per_night, max_guests, bedrooms, bathrooms, surface_area, status)
VALUES ('e4a7c3b1-9f28-4d65-b1e3-8c2d5f7a0b94', 'e306e358-43af-4146-bc41-c5352d34deda',
    'Appartement lumineux face au lac d''Annecy', 'Superbe T3 de 72m2 avec vue imprenable sur le lac d''Annecy et les montagnes. Sejour spacieux ouvrant sur un grand balcon, cuisine moderne.',
    'APARTMENT', '18 Avenue d''Albigny', 'Annecy', 'France', '74000', 45.8992, 6.1294, 135.00, 4, 2, 1, 72.00, 'ACTIVE');

INSERT INTO listings (id, owner_id, title, description, property_type, address, city, country, zip_code, latitude, longitude, price_per_night, max_guests, bedrooms, bathrooms, surface_area, status)
VALUES ('7b3d9e12-a456-4f8c-b7e1-2c9d0f5a3e68', '4a847537-998b-4632-acce-3b873e455608',
    'Maison de surfeur a deux pas de la Grande Plage', 'Maison basque renovee avec charme, situee a 200 metres de la Grande Plage de Biarritz. Trois chambres dont une suite parentale.',
    'HOUSE', '7 Rue du Port-Vieux', 'Biarritz', 'France', '64200', 43.4832, -1.5586, 175.00, 6, 3, 2, 110.00, 'ACTIVE');

INSERT INTO listings (id, owner_id, title, description, property_type, address, city, country, zip_code, latitude, longitude, price_per_night, max_guests, bedrooms, bathrooms, surface_area, status)
VALUES ('1f8a4c67-3b92-4e5d-a0c8-9d6e7f2b1a43', '0f6e1318-3c69-4c01-8e60-76cb240e52ba',
    'Studio de charme dans la Petite Venise de Colmar', 'Adorable studio de 30m2 au coeur de la Petite Venise, dans une maison a colombages du XVIIe siecle.',
    'STUDIO', '12 Quai de la Poissonnerie', 'Colmar', 'France', '68000', 48.0793, 7.3550, 78.00, 2, 0, 1, 30.00, 'ACTIVE');

INSERT INTO listings (id, owner_id, title, description, property_type, address, city, country, zip_code, latitude, longitude, price_per_night, max_guests, bedrooms, bathrooms, surface_area, status)
VALUES ('5e2b8d94-c1a7-4f36-9e08-3d7c6b5a4f21', 'ec7a76f9-7a66-415a-9199-c8054be7c2a0',
    'Appartement de caractere intra-muros Avignon', 'Bel appartement de 65m2 dans un hotel particulier du XVIIIe siecle, au coeur des remparts d''Avignon.',
    'APARTMENT', '5 Rue des Teinturiers', 'Avignon', 'France', '84000', 43.9493, 4.8055, 115.00, 4, 2, 1, 65.00, 'ACTIVE');

INSERT INTO listings (id, owner_id, title, description, property_type, address, city, country, zip_code, latitude, longitude, price_per_night, max_guests, bedrooms, bathrooms, surface_area, status)
VALUES ('8c6f1a35-d4e9-4b72-a3c0-5e1d9f8b2a67', 'd2445a96-8c32-4c13-9bc2-3b7320339d31',
    'Appartement vue sur le Vieux Port de La Rochelle', 'Charmant appartement de 55m2 donnant directement sur le Vieux Port et les celebres tours medievales.',
    'APARTMENT', '23 Cours des Dames', 'La Rochelle', 'France', '17000', 46.1591, -1.1520, 125.00, 3, 1, 1, 55.00, 'ACTIVE');

INSERT INTO listings (id, owner_id, title, description, property_type, address, city, country, zip_code, latitude, longitude, price_per_night, max_guests, bedrooms, bathrooms, surface_area, status)
VALUES ('9a1b3c5d-7e2f-4a6b-8c0d-e4f2a8b6c1d3', '4a847537-998b-4632-acce-3b873e455608',
    'Maison bretonne au coeur de Rennes', 'Authentique maison a pans de bois dans le centre historique de Rennes, a deux pas de la place des Lices.',
    'HOUSE', '10 Rue de la Psalette', 'Rennes', 'France', '35000', 48.1113, -1.6800, 95.00, 4, 2, 1, 75.00, 'ACTIVE');

INSERT INTO listings (id, owner_id, title, description, property_type, address, city, country, zip_code, latitude, longitude, price_per_night, max_guests, bedrooms, bathrooms, surface_area, status)
VALUES ('3f5a7c9e-1d2b-4e6f-8a0c-b4d6e8f2a1c3', '0f6e1318-3c69-4c01-8e60-76cb240e52ba',
    'Loft industriel sur l''ile de Nantes', 'Superbe loft de 95m2 dans un ancien entrepot rehabilite sur l''ile de Nantes, face aux Machines de l''ile.',
    'APARTMENT', '3 Rue la Noue Bras de Fer', 'Nantes', 'France', '44200', 47.2074, -1.5466, 140.00, 5, 2, 1, 95.00, 'ACTIVE');

INSERT INTO listing_amenities (listing_id, amenity) VALUES
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'WiFi'), ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'Chauffage'), ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'Cuisine'), ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'Lave-linge'),
    ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'WiFi'), ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'Climatisation'), ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'Espace de travail'),
    ('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'WiFi'), ('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'Piscine'), ('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'Climatisation'), ('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'Parking'),
    ('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'WiFi'), ('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'Cuisine'), ('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'Chauffage'), ('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'Lave-linge'),
    ('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 'WiFi'), ('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 'Chauffage'),
    ('a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', 'WiFi'), ('a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', 'Chauffage'), ('a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', 'Espace de travail'),
    ('b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', 'WiFi'), ('b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', 'Cuisine'), ('b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', 'Parking'), ('b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', 'Lave-linge'),
    ('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'WiFi'), ('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'Climatisation'), ('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'TV'), ('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'Espace de travail'),
    ('d0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a', 'WiFi'), ('d0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a', 'Chauffage'),
    ('e4a7c3b1-9f28-4d65-b1e3-8c2d5f7a0b94', 'WiFi'), ('e4a7c3b1-9f28-4d65-b1e3-8c2d5f7a0b94', 'Cuisine'), ('e4a7c3b1-9f28-4d65-b1e3-8c2d5f7a0b94', 'Chauffage'), ('e4a7c3b1-9f28-4d65-b1e3-8c2d5f7a0b94', 'Parking'),
    ('7b3d9e12-a456-4f8c-b7e1-2c9d0f5a3e68', 'WiFi'), ('7b3d9e12-a456-4f8c-b7e1-2c9d0f5a3e68', 'Cuisine'), ('7b3d9e12-a456-4f8c-b7e1-2c9d0f5a3e68', 'Lave-linge'), ('7b3d9e12-a456-4f8c-b7e1-2c9d0f5a3e68', 'Parking'),
    ('1f8a4c67-3b92-4e5d-a0c8-9d6e7f2b1a43', 'WiFi'), ('1f8a4c67-3b92-4e5d-a0c8-9d6e7f2b1a43', 'Chauffage'), ('1f8a4c67-3b92-4e5d-a0c8-9d6e7f2b1a43', 'Cuisine'),
    ('5e2b8d94-c1a7-4f36-9e08-3d7c6b5a4f21', 'WiFi'), ('5e2b8d94-c1a7-4f36-9e08-3d7c6b5a4f21', 'Climatisation'), ('5e2b8d94-c1a7-4f36-9e08-3d7c6b5a4f21', 'Cuisine'), ('5e2b8d94-c1a7-4f36-9e08-3d7c6b5a4f21', 'Lave-linge'),
    ('8c6f1a35-d4e9-4b72-a3c0-5e1d9f8b2a67', 'WiFi'), ('8c6f1a35-d4e9-4b72-a3c0-5e1d9f8b2a67', 'Cuisine'), ('8c6f1a35-d4e9-4b72-a3c0-5e1d9f8b2a67', 'TV'), ('8c6f1a35-d4e9-4b72-a3c0-5e1d9f8b2a67', 'Chauffage'),
    ('9a1b3c5d-7e2f-4a6b-8c0d-e4f2a8b6c1d3', 'WiFi'), ('9a1b3c5d-7e2f-4a6b-8c0d-e4f2a8b6c1d3', 'Chauffage'), ('9a1b3c5d-7e2f-4a6b-8c0d-e4f2a8b6c1d3', 'Cuisine'),
    ('3f5a7c9e-1d2b-4e6f-8a0c-b4d6e8f2a1c3', 'WiFi'), ('3f5a7c9e-1d2b-4e6f-8a0c-b4d6e8f2a1c3', 'Cuisine'), ('3f5a7c9e-1d2b-4e6f-8a0c-b4d6e8f2a1c3', 'Espace de travail'), ('3f5a7c9e-1d2b-4e6f-8a0c-b4d6e8f2a1c3', 'Lave-linge'), ('3f5a7c9e-1d2b-4e6f-8a0c-b4d6e8f2a1c3', 'Climatisation');

INSERT INTO listing_images (listing_id, image_url, is_primary, sort_order) VALUES
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800', TRUE, 0),
    ('a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', FALSE, 1),
    ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800', TRUE, 0),
    ('b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800', FALSE, 1),
    ('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800', TRUE, 0),
    ('c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', FALSE, 1),
    ('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', TRUE, 0),
    ('d4e5f6a7-b8c9-4d0e-1f2a-3b4c5d6e7f8a', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', FALSE, 1),
    ('e5f6a7b8-c9d0-4e1f-2a3b-4c5d6e7f8a9b', 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800', TRUE, 0),
    ('a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800', TRUE, 0),
    ('a7b8c9d0-e1f2-4a3b-4c5d-6e7f8a9b0c1d', 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800', FALSE, 1),
    ('b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', TRUE, 0),
    ('b8c9d0e1-f2a3-4b4c-5d6e-7f8a9b0c1d2e', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800', FALSE, 1),
    ('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', TRUE, 0),
    ('c9d0e1f2-a3b4-4c5d-6e7f-8a9b0c1d2e3f', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', FALSE, 1),
    ('d0e1f2a3-b4c5-4d6e-7f8a-9b0c1d2e3f4a', 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800', TRUE, 0),
    ('e4a7c3b1-9f28-4d65-b1e3-8c2d5f7a0b94', 'https://images.unsplash.com/photo-1502672023488-70e25813eb80?w=800', TRUE, 0),
    ('e4a7c3b1-9f28-4d65-b1e3-8c2d5f7a0b94', 'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800', FALSE, 1),
    ('7b3d9e12-a456-4f8c-b7e1-2c9d0f5a3e68', 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800', TRUE, 0),
    ('7b3d9e12-a456-4f8c-b7e1-2c9d0f5a3e68', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', FALSE, 1),
    ('1f8a4c67-3b92-4e5d-a0c8-9d6e7f2b1a43', 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800', TRUE, 0),
    ('5e2b8d94-c1a7-4f36-9e08-3d7c6b5a4f21', 'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800', TRUE, 0),
    ('5e2b8d94-c1a7-4f36-9e08-3d7c6b5a4f21', 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800', FALSE, 1),
    ('8c6f1a35-d4e9-4b72-a3c0-5e1d9f8b2a67', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', TRUE, 0),
    ('8c6f1a35-d4e9-4b72-a3c0-5e1d9f8b2a67', 'https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800', FALSE, 1),
    ('9a1b3c5d-7e2f-4a6b-8c0d-e4f2a8b6c1d3', 'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800', TRUE, 0),
    ('3f5a7c9e-1d2b-4e6f-8a0c-b4d6e8f2a1c3', 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800', TRUE, 0),
    ('3f5a7c9e-1d2b-4e6f-8a0c-b4d6e8f2a1c3', 'https://images.unsplash.com/photo-1536376072261-38c75010e6c9?w=800', FALSE, 1);
