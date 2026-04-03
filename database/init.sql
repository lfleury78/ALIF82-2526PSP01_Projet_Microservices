CREATE DATABASE IF NOT EXISTS hessbnb
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE hessbnb;

CREATE TABLE utilisateur (
    id_user          INT PRIMARY KEY AUTO_INCREMENT,
    nom              VARCHAR(100) NOT NULL,
    prenom           VARCHAR(100) NOT NULL,
    email            VARCHAR(255) UNIQUE NOT NULL,
    mot_de_passe     VARCHAR(255) NOT NULL,
    role             ENUM('LOCATAIRE', 'PROPRIETAIRE', 'LES_DEUX') DEFAULT 'LOCATAIRE',
    telephone        VARCHAR(20),
    date_inscription DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE logement (
    id_logement      INT PRIMARY KEY AUTO_INCREMENT,
    id_proprietaire  INT NOT NULL,
    type_logement    ENUM('APPARTEMENT', 'MAISON', 'STUDIO', 'VILLA') NOT NULL,
    ville            VARCHAR(100) NOT NULL,
    adresse          VARCHAR(255),
    capacite         INT NOT NULL,
    nb_chambres      INT DEFAULT 1,
    date_creation    DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_logement_proprietaire FOREIGN KEY (id_proprietaire)
        REFERENCES utilisateur (id_user) ON DELETE RESTRICT
);

CREATE INDEX idx_logement_ville        ON logement (ville);
CREATE INDEX idx_logement_proprietaire ON logement (id_proprietaire);
CREATE INDEX idx_logement_type         ON logement (type_logement);

CREATE TABLE annonce (
    id_annonce       INT PRIMARY KEY AUTO_INCREMENT,
    id_logement      INT NOT NULL,
    titre            VARCHAR(200) NOT NULL,
    description      TEXT,
    prix_par_nuit    DECIMAL(10,2) NOT NULL,
    disponible       BOOLEAN DEFAULT TRUE,
    statut           ENUM('ACTIVE', 'PAUSE', 'SUPPRIMEE') DEFAULT 'ACTIVE',
    date_publication DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_annonce_logement FOREIGN KEY (id_logement)
        REFERENCES logement (id_logement) ON DELETE CASCADE
);

CREATE INDEX idx_annonce_logement   ON annonce (id_logement);
CREATE INDEX idx_annonce_statut     ON annonce (statut);
CREATE INDEX idx_annonce_disponible ON annonce (disponible);
CREATE INDEX idx_annonce_prix       ON annonce (prix_par_nuit);

CREATE TABLE reservation (
    id_reservation INT PRIMARY KEY AUTO_INCREMENT,
    id_annonce     INT NOT NULL,
    id_locataire   INT NOT NULL,
    date_debut     DATE NOT NULL,
    date_fin       DATE NOT NULL,
    nb_voyageurs   INT NOT NULL,
    prix_total     DECIMAL(10,2) NOT NULL,
    statut         ENUM('EN_ATTENTE', 'CONFIRMEE', 'ANNULEE', 'TERMINEE') DEFAULT 'EN_ATTENTE',
    date_creation  DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_reservation_annonce   FOREIGN KEY (id_annonce)   REFERENCES annonce     (id_annonce) ON DELETE RESTRICT,
    CONSTRAINT fk_reservation_locataire FOREIGN KEY (id_locataire) REFERENCES utilisateur (id_user)    ON DELETE RESTRICT,
    CONSTRAINT chk_reservation_dates    CHECK (date_fin > date_debut)
);

CREATE INDEX idx_reservation_annonce   ON reservation (id_annonce);
CREATE INDEX idx_reservation_locataire ON reservation (id_locataire);
CREATE INDEX idx_reservation_statut    ON reservation (statut);
CREATE INDEX idx_reservation_dates     ON reservation (id_annonce, statut, date_debut, date_fin);

CREATE TABLE avis (
    id_avis        INT PRIMARY KEY AUTO_INCREMENT,
    id_reservation INT NOT NULL,
    id_annonce     INT NOT NULL,
    id_auteur      INT NOT NULL,
    note           INT NOT NULL,
    commentaire    TEXT,
    date_avis      DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_avis_reservation FOREIGN KEY (id_reservation) REFERENCES reservation (id_reservation) ON DELETE CASCADE,
    CONSTRAINT fk_avis_annonce     FOREIGN KEY (id_annonce)     REFERENCES annonce     (id_annonce)     ON DELETE CASCADE,
    CONSTRAINT fk_avis_auteur      FOREIGN KEY (id_auteur)      REFERENCES utilisateur (id_user)        ON DELETE CASCADE,
    CONSTRAINT uq_avis_reservation UNIQUE (id_reservation),
    CONSTRAINT chk_avis_note       CHECK (note BETWEEN 1 AND 5)
);

CREATE INDEX idx_avis_annonce ON avis (id_annonce);
CREATE INDEX idx_avis_auteur  ON avis (id_auteur);

CREATE TABLE conversation (
    id_conversation  INT PRIMARY KEY AUTO_INCREMENT,
    id_user_1        INT NOT NULL,
    id_user_2        INT NOT NULL,
    id_annonce       INT,
    date_creation    DATETIME DEFAULT CURRENT_TIMESTAMP,
    date_dernier_msg DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_conversation_user1   FOREIGN KEY (id_user_1)  REFERENCES utilisateur (id_user)  ON DELETE CASCADE,
    CONSTRAINT fk_conversation_user2   FOREIGN KEY (id_user_2)  REFERENCES utilisateur (id_user)  ON DELETE CASCADE,
    CONSTRAINT fk_conversation_annonce FOREIGN KEY (id_annonce) REFERENCES annonce     (id_annonce) ON DELETE SET NULL
);

CREATE INDEX idx_conversation_users   ON conversation (id_user_1, id_user_2);
CREATE INDEX idx_conversation_annonce ON conversation (id_annonce);

CREATE TABLE message (
    id_message      INT PRIMARY KEY AUTO_INCREMENT,
    id_conversation INT NOT NULL,
    id_expediteur   INT NOT NULL,
    contenu         TEXT NOT NULL,
    lu              BOOLEAN DEFAULT FALSE,
    date_envoi      DATETIME DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_message_conversation FOREIGN KEY (id_conversation) REFERENCES conversation (id_conversation) ON DELETE CASCADE,
    CONSTRAINT fk_message_expediteur   FOREIGN KEY (id_expediteur)   REFERENCES utilisateur  (id_user)         ON DELETE CASCADE
);

CREATE INDEX idx_message_conversation ON message (id_conversation);
CREATE INDEX idx_message_expediteur   ON message (id_expediteur);
CREATE INDEX idx_message_lu           ON message (id_conversation, lu);
