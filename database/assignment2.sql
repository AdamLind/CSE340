-- QUERY 1
INSERT INTO account (account_firstname, account_lastname, account_email, account_password)
VALUES ('Tony', 'Stark', 'tony@starkent.com', 'Iam1ronM@n');

-- QUERY 2
UPDATE account
SET account_type = 'Admin'
WHERE account_email = 'tony@starkent.com';

-- QUERY 3
DELETE FROM account
WHERE account_email = 'tony@starkent.com';

-- QUERY 4
UPDATE
  inventory
SET
  inv_description = REPLACE(inv_description, 'small interiors', 'huge interior')
WHERE
  inv_model = 'Hummer';

-- QUERY 5
SELECT 
	classification_name,
	inv_model
FROM
	classification
INNER JOIN inventory
	ON classification.classification_id = inventory.classification_id
	WHERE classification. classification_name = 'Sport';

-- QUERY 6
UPDATE
  inventory
SET
  inv_image = REPLACE(inv_image, 'images/', 'images/vehicles/'),
  inv_thumbnail = REPLACE(inv_thumbnail, 'images/', 'images/vehicles/');