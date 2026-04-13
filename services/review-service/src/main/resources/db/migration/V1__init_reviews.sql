CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL,
    booking_id UUID NOT NULL UNIQUE,
    reviewer_id UUID NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_reviews_listing_id ON reviews(listing_id);
CREATE INDEX idx_reviews_booking_id ON reviews(booking_id);
CREATE INDEX idx_reviews_reviewer_id ON reviews(reviewer_id);

INSERT INTO reviews (id, listing_id, booking_id, reviewer_id, rating, comment, created_at) VALUES
('22222222-aaaa-4bbb-cccc-dddddddddd01', 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d', '11111111-aaaa-4bbb-cccc-dddddddddd01', '4a847537-998b-4632-acce-3b873e455608', 5, 'Sejour parfait ! L''appartement est exactement comme sur les photos, tres bien situe dans le Marais. Marie a ete tres accueillante et disponible. Je recommande vivement !', '2026-02-16 10:30:00'),
('22222222-aaaa-4bbb-cccc-dddddddddd02', 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f', '11111111-aaaa-4bbb-cccc-dddddddddd02', 'd2445a96-8c32-4c13-9bc2-3b7320339d31', 4, 'Tres belle villa avec une vue magnifique sur la baie. La piscine etait un vrai plus. Seul petit bemol : la cuisine aurait merite un peu plus d''equipements. Mais globalement un excellent sejour entre amis !', '2026-02-28 14:00:00'),
('22222222-aaaa-4bbb-cccc-dddddddddd03', 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e', '11111111-aaaa-4bbb-cccc-dddddddddd06', 'c2b22472-32f3-4e1f-965d-28bbe3c407f8', 5, 'Studio tres propre et fonctionnel, idealement place pour decouvrir Lyon. Jean est un hote reactif et sympathique.', '2026-03-19 09:00:00');
