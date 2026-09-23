-- =====================================================================
-- Chefcito — Seed de datos de demo
-- =====================================================================
-- Para qué sirve: cargar de una sola pasada datos de prueba realistas
-- (categorías, ingredientes con valores nutricionales, usuarios, recetas
-- completas con pasos/ingredientes/imagen, guardados y reseñas) para
-- poder mostrarle al profesor la app funcionando sin cargar todo a mano.
--
-- Cómo usarlo:
--   1. Abrí MySQL Workbench, conectate a la base de Chefcito (la misma
--      que usa tu backend/.env -> DATABASE_URL) y seleccionala como
--      base activa (USE chefcito; o la que corresponda).
--   2. Pegá este archivo completo en una pestaña de SQL y ejecutalo
--      entero (el rayito de "Execute all", o Ctrl+Shift+Enter).
--   3. Se ejecuta dentro de una transacción: si algo falla a mitad de
--      camino, no queda la base a medio cargar — corré ROLLBACK; y
--      fijate el error antes de reintentar.
--
-- Importante: username y email son UNIQUE en la tabla user, así que si
-- corrés este script dos veces la segunda va a fallar ahí (a propósito:
-- evita duplicar todos los usuarios/recetas de prueba sin darte cuenta).
-- Si eso pasa y ya tenías estos datos de una corrida anterior, no hace
-- falta correrlo de nuevo.
--
-- Contraseña de todos los usuarios de prueba: Chefcito123
-- (hasheada con bcrypt, igual que hace el backend al registrarse)
-- =====================================================================

START TRANSACTION;

-- ---------------------------------------------------------------------
-- 0. Rol "Usuario" (el backend lo crea solo al registrarse si no existe,
--    pero como acá insertamos usuarios directo por SQL, sin pasar por el
--    endpoint de registro, hace falta asegurarlo antes).
-- ---------------------------------------------------------------------
INSERT INTO role (name, description)
SELECT 'Usuario', 'Rol asignado por defecto a todo usuario que se registra.'
WHERE NOT EXISTS (SELECT 1 FROM role WHERE name = 'Usuario');

SET @rol_usuario := (SELECT id FROM role WHERE name = 'Usuario' LIMIT 1);

-- ---------------------------------------------------------------------
-- 1. Categorías de ingredientes
-- ---------------------------------------------------------------------
INSERT INTO ingredientcategory (name, description) VALUES
  ('Verduras y Hortalizas', 'Vegetales frescos de uso diario'),
  ('Carnes', 'Carnes rojas, blancas y huevo'),
  ('Lácteos', 'Leche, quesos y derivados'),
  ('Cereales y Legumbres', 'Arroz, pastas, harinas y legumbres'),
  ('Condimentos y Especias', 'Sal, especias, aceites y aderezos');

SET @cat_verduras   := (SELECT id FROM ingredientcategory WHERE name = 'Verduras y Hortalizas' LIMIT 1);
SET @cat_carnes     := (SELECT id FROM ingredientcategory WHERE name = 'Carnes' LIMIT 1);
SET @cat_lacteos    := (SELECT id FROM ingredientcategory WHERE name = 'Lácteos' LIMIT 1);
SET @cat_cereales   := (SELECT id FROM ingredientcategory WHERE name = 'Cereales y Legumbres' LIMIT 1);
SET @cat_condimentos:= (SELECT id FROM ingredientcategory WHERE name = 'Condimentos y Especias' LIMIT 1);

-- ---------------------------------------------------------------------
-- 2. Ingredientes
-- ---------------------------------------------------------------------
INSERT INTO ingredient (name, description, unitOfMeasure) VALUES
  ('Tomate', 'Tomate fresco', 'g'),
  ('Cebolla', 'Cebolla blanca', 'g'),
  ('Papa', 'Papa para puré o guiso', 'g'),
  ('Zanahoria', 'Zanahoria fresca', 'g'),
  ('Lechuga', 'Lechuga criolla', 'g'),
  ('Carne picada', 'Carne vacuna picada', 'g'),
  ('Pechuga de pollo', 'Pechuga de pollo sin piel', 'g'),
  ('Huevo', 'Huevo de gallina', 'unidad'),
  ('Leche', 'Leche entera', 'ml'),
  ('Queso cremoso', 'Queso cremoso para gratinar', 'g'),
  ('Manteca', 'Manteca sin sal', 'g'),
  ('Arroz', 'Arroz blanco', 'g'),
  ('Fideos', 'Fideos secos tipo spaghetti', 'g'),
  ('Harina', 'Harina de trigo 0000', 'g'),
  ('Lentejas', 'Lentejas secas', 'g'),
  ('Sal', 'Sal fina', 'g'),
  ('Pimienta negra', 'Pimienta negra molida', 'g'),
  ('Aceite de oliva', 'Aceite de oliva extra virgen', 'ml');

SET @ing_tomate    := (SELECT id FROM ingredient WHERE name = 'Tomate' LIMIT 1);
SET @ing_cebolla   := (SELECT id FROM ingredient WHERE name = 'Cebolla' LIMIT 1);
SET @ing_papa      := (SELECT id FROM ingredient WHERE name = 'Papa' LIMIT 1);
SET @ing_zanahoria := (SELECT id FROM ingredient WHERE name = 'Zanahoria' LIMIT 1);
SET @ing_lechuga   := (SELECT id FROM ingredient WHERE name = 'Lechuga' LIMIT 1);
SET @ing_carne     := (SELECT id FROM ingredient WHERE name = 'Carne picada' LIMIT 1);
SET @ing_pollo     := (SELECT id FROM ingredient WHERE name = 'Pechuga de pollo' LIMIT 1);
SET @ing_huevo     := (SELECT id FROM ingredient WHERE name = 'Huevo' LIMIT 1);
SET @ing_leche     := (SELECT id FROM ingredient WHERE name = 'Leche' LIMIT 1);
SET @ing_queso     := (SELECT id FROM ingredient WHERE name = 'Queso cremoso' LIMIT 1);
SET @ing_manteca   := (SELECT id FROM ingredient WHERE name = 'Manteca' LIMIT 1);
SET @ing_arroz     := (SELECT id FROM ingredient WHERE name = 'Arroz' LIMIT 1);
SET @ing_fideos    := (SELECT id FROM ingredient WHERE name = 'Fideos' LIMIT 1);
SET @ing_harina    := (SELECT id FROM ingredient WHERE name = 'Harina' LIMIT 1);
SET @ing_lentejas  := (SELECT id FROM ingredient WHERE name = 'Lentejas' LIMIT 1);
SET @ing_sal       := (SELECT id FROM ingredient WHERE name = 'Sal' LIMIT 1);
SET @ing_pimienta  := (SELECT id FROM ingredient WHERE name = 'Pimienta negra' LIMIT 1);
SET @ing_aceite    := (SELECT id FROM ingredient WHERE name = 'Aceite de oliva' LIMIT 1);

-- Vínculo ingrediente <-> categoría
INSERT INTO ingredientcategoryingredient (idIngredientCategory, idIngredient) VALUES
  (@cat_verduras, @ing_tomate),
  (@cat_verduras, @ing_cebolla),
  (@cat_verduras, @ing_papa),
  (@cat_verduras, @ing_zanahoria),
  (@cat_verduras, @ing_lechuga),
  (@cat_carnes, @ing_carne),
  (@cat_carnes, @ing_pollo),
  (@cat_carnes, @ing_huevo),
  (@cat_lacteos, @ing_leche),
  (@cat_lacteos, @ing_queso),
  (@cat_lacteos, @ing_manteca),
  (@cat_cereales, @ing_arroz),
  (@cat_cereales, @ing_fideos),
  (@cat_cereales, @ing_harina),
  (@cat_cereales, @ing_lentejas),
  (@cat_condimentos, @ing_sal),
  (@cat_condimentos, @ing_pimienta),
  (@cat_condimentos, @ing_aceite);

-- Valores nutricionales (cada fila: num=1 Calorías, num=2 Proteínas) para
-- los ingredientes más usados en las recetas de abajo.
INSERT INTO nutritionalvalue (idIngredient, num, name, servingAmount, servingUnit, value) VALUES
  (@ing_tomate,  1, 'Calorías',   100, 'g', 18),
  (@ing_tomate,  2, 'Proteínas',  100, 'g', 0.9),
  (@ing_papa,    1, 'Calorías',   100, 'g', 77),
  (@ing_papa,    2, 'Proteínas',  100, 'g', 2.0),
  (@ing_carne,   1, 'Calorías',   100, 'g', 250),
  (@ing_carne,   2, 'Proteínas',  100, 'g', 26),
  (@ing_pollo,   1, 'Calorías',   100, 'g', 165),
  (@ing_pollo,   2, 'Proteínas',  100, 'g', 31),
  (@ing_huevo,   1, 'Calorías',   50,  'g', 78),
  (@ing_huevo,   2, 'Proteínas',  50,  'g', 6.3),
  (@ing_arroz,   1, 'Calorías',   100, 'g', 130),
  (@ing_arroz,   2, 'Proteínas',  100, 'g', 2.7),
  (@ing_lentejas,1, 'Calorías',   100, 'g', 116),
  (@ing_lentejas,2, 'Proteínas',  100, 'g', 9.0),
  (@ing_queso,   1, 'Calorías',   100, 'g', 300),
  (@ing_queso,   2, 'Proteínas',  100, 'g', 14);

-- ---------------------------------------------------------------------
-- 3. Categorías de recetas
-- ---------------------------------------------------------------------
INSERT INTO category (name, description) VALUES
  ('Carnes', 'Platos principales con carne o pollo'),
  ('Pastas', 'Fideos, ñoquis y salsas'),
  ('Ensaladas', 'Platos fríos y livianos'),
  ('Postres', 'Dulces y postres caseros'),
  ('Guisos y Sopas', 'Platos de cuchara');

SET @rc_carnes    := (SELECT id FROM category WHERE name = 'Carnes' LIMIT 1);
SET @rc_pastas    := (SELECT id FROM category WHERE name = 'Pastas' LIMIT 1);
SET @rc_ensaladas := (SELECT id FROM category WHERE name = 'Ensaladas' LIMIT 1);
SET @rc_postres   := (SELECT id FROM category WHERE name = 'Postres' LIMIT 1);
SET @rc_guisos    := (SELECT id FROM category WHERE name = 'Guisos y Sopas' LIMIT 1);

-- ---------------------------------------------------------------------
-- 4. Usuarios de prueba (todos con contraseña: Chefcito123)
-- ---------------------------------------------------------------------
INSERT INTO user (username, password, name, lastName, email, phone, bio, specialty, location, birthDate, createdAt) VALUES
  ('juanperez', '$2b$10$5b3lLn2fjGA9lTLQmPySveop6DxgmfYO1VzVlzxJmlNM6y5UxWTxS', 'Juan', 'Pérez', 'juan.perez.demo@chefcito.com', '+54 341 555-0101', 'Me encanta cocinar platos caseros de toda la vida.', 'Cocina casera', 'Rosario, Santa Fe', '1990-04-12', DATE_SUB(NOW(), INTERVAL 60 DAY)),
  ('mariagomez', '$2b$10$5b3lLn2fjGA9lTLQmPySveop6DxgmfYO1VzVlzxJmlNM6y5UxWTxS', 'María', 'Gómez', 'maria.gomez.demo@chefcito.com', '+54 341 555-0102', 'Fan de las pastas caseras y las tartas.', 'Pastas caseras', 'Buenos Aires', '1995-08-23', DATE_SUB(NOW(), INTERVAL 45 DAY)),
  ('carlosdiaz', '$2b$10$5b3lLn2fjGA9lTLQmPySveop6DxgmfYO1VzVlzxJmlNM6y5UxWTxS', 'Carlos', 'Díaz', 'carlos.diaz.demo@chefcito.com', '+54 341 555-0103', 'Siempre con un guiso en el fuego.', 'Guisos y platos de cuchara', 'Córdoba', '1988-01-30', DATE_SUB(NOW(), INTERVAL 30 DAY)),
  ('luciafernandez', '$2b$10$5b3lLn2fjGA9lTLQmPySveop6DxgmfYO1VzVlzxJmlNM6y5UxWTxS', 'Lucía', 'Fernández', 'lucia.fernandez.demo@chefcito.com', '+54 341 555-0104', 'Amante de los postres caseros.', 'Repostería', 'Mendoza', '1998-11-05', DATE_SUB(NOW(), INTERVAL 20 DAY)),
  ('martinlopez', '$2b$10$5b3lLn2fjGA9lTLQmPySveop6DxgmfYO1VzVlzxJmlNM6y5UxWTxS', 'Martín', 'López', 'martin.lopez.demo@chefcito.com', '+54 341 555-0105', 'Cocino simple, rápido y sabroso.', 'Comidas rápidas', 'La Plata', '1992-06-17', DATE_SUB(NOW(), INTERVAL 10 DAY));

SET @user_juan   := (SELECT id FROM user WHERE username = 'juanperez' LIMIT 1);
SET @user_maria  := (SELECT id FROM user WHERE username = 'mariagomez' LIMIT 1);
SET @user_carlos := (SELECT id FROM user WHERE username = 'carlosdiaz' LIMIT 1);
SET @user_lucia  := (SELECT id FROM user WHERE username = 'luciafernandez' LIMIT 1);
SET @user_martin := (SELECT id FROM user WHERE username = 'martinlopez' LIMIT 1);

INSERT INTO userrole (UserId, RoleId) VALUES
  (@user_juan, @rol_usuario),
  (@user_maria, @rol_usuario),
  (@user_carlos, @rol_usuario),
  (@user_lucia, @rol_usuario),
  (@user_martin, @rol_usuario);

-- ---------------------------------------------------------------------
-- 5. Recetas (con imagen de portada, categoría, ingredientes y pasos)
-- ---------------------------------------------------------------------

-- 5.1 Milanesas con puré (Juan · Carnes)
INSERT INTO recipe (idUser, name, description, preparationTime, difficulty, createdAt, saveCount)
VALUES (@user_juan, 'Milanesas con puré', 'Milanesas de carne clásicas acompañadas de puré de papas casero.', 40, 'Media', DATE_SUB(NOW(), INTERVAL 25 DAY), 0);
SET @recipe_milanesas := LAST_INSERT_ID();
INSERT INTO recipecategory (idRecipe, idCategory) VALUES (@recipe_milanesas, @rc_carnes);
INSERT INTO recipeingredient (idRecipe, idIngredient, requiredQuantity) VALUES
  (@recipe_milanesas, @ing_carne, 500), (@recipe_milanesas, @ing_huevo, 2), (@recipe_milanesas, @ing_papa, 600);
INSERT INTO step (idRecipe, id, stepNumber, instruction, estimatedTime) VALUES
  (@recipe_milanesas, 1, 1, 'Pasar las milanesas por huevo batido y pan rallado.', 10),
  (@recipe_milanesas, 2, 2, 'Freír en aceite caliente hasta dorar de ambos lados.', 15),
  (@recipe_milanesas, 3, 3, 'Hervir las papas, hacer puré con manteca y leche.', 20);
INSERT INTO image (idRecipe, id, imageUrl, isMain) VALUES
  (@recipe_milanesas, 1, 'https://placehold.co/600x400/f9f3eb/4b6400?text=Milanesas+con+pur%C3%A9', 1);

-- 5.2 Ensalada César (Juan · Ensaladas)
INSERT INTO recipe (idUser, name, description, preparationTime, difficulty, createdAt, saveCount)
VALUES (@user_juan, 'Ensalada César', 'Ensalada fresca con pollo grillado, lechuga y aderezo casero.', 15, 'Fácil', DATE_SUB(NOW(), INTERVAL 5 DAY), 0);
SET @recipe_cesar := LAST_INSERT_ID();
INSERT INTO recipecategory (idRecipe, idCategory) VALUES (@recipe_cesar, @rc_ensaladas);
INSERT INTO recipeingredient (idRecipe, idIngredient, requiredQuantity) VALUES
  (@recipe_cesar, @ing_lechuga, 200), (@recipe_cesar, @ing_pollo, 300), (@recipe_cesar, @ing_queso, 50);
INSERT INTO step (idRecipe, id, stepNumber, instruction, estimatedTime) VALUES
  (@recipe_cesar, 1, 1, 'Grillar la pechuga de pollo y cortarla en tiras.', 10),
  (@recipe_cesar, 2, 2, 'Mezclar la lechuga con el pollo y el queso en láminas.', 5);
INSERT INTO image (idRecipe, id, imageUrl, isMain) VALUES
  (@recipe_cesar, 1, 'https://placehold.co/600x400/f9f3eb/4b6400?text=Ensalada+Cesar', 1);

-- 5.3 Fideos con tuco (María · Pastas)
INSERT INTO recipe (idUser, name, description, preparationTime, difficulty, createdAt, saveCount)
VALUES (@user_maria, 'Fideos con tuco', 'Fideos secos con salsa de tomate casera y cebolla.', 25, 'Fácil', DATE_SUB(NOW(), INTERVAL 18 DAY), 0);
SET @recipe_fideos := LAST_INSERT_ID();
INSERT INTO recipecategory (idRecipe, idCategory) VALUES (@recipe_fideos, @rc_pastas);
INSERT INTO recipeingredient (idRecipe, idIngredient, requiredQuantity) VALUES
  (@recipe_fideos, @ing_fideos, 500), (@recipe_fideos, @ing_tomate, 400), (@recipe_fideos, @ing_cebolla, 100);
INSERT INTO step (idRecipe, id, stepNumber, instruction, estimatedTime) VALUES
  (@recipe_fideos, 1, 1, 'Rehogar la cebolla picada en aceite de oliva.', 5),
  (@recipe_fideos, 2, 2, 'Agregar el tomate triturado y cocinar la salsa 15 minutos.', 15),
  (@recipe_fideos, 3, 3, 'Hervir los fideos y mezclar con la salsa.', 10);
INSERT INTO image (idRecipe, id, imageUrl, isMain) VALUES
  (@recipe_fideos, 1, 'https://placehold.co/600x400/f9f3eb/4b6400?text=Fideos+con+tuco', 1);

-- 5.4 Tarta de verduras (María · Ensaladas)
INSERT INTO recipe (idUser, name, description, preparationTime, difficulty, createdAt, saveCount)
VALUES (@user_maria, 'Tarta de verduras', 'Tarta casera de verduras con huevo y queso.', 45, 'Media', DATE_SUB(NOW(), INTERVAL 3 DAY), 0);
SET @recipe_tarta := LAST_INSERT_ID();
INSERT INTO recipecategory (idRecipe, idCategory) VALUES (@recipe_tarta, @rc_ensaladas);
INSERT INTO recipeingredient (idRecipe, idIngredient, requiredQuantity) VALUES
  (@recipe_tarta, @ing_zanahoria, 200), (@recipe_tarta, @ing_huevo, 3), (@recipe_tarta, @ing_queso, 150);
INSERT INTO step (idRecipe, id, stepNumber, instruction, estimatedTime) VALUES
  (@recipe_tarta, 1, 1, 'Rallar la zanahoria y mezclar con los huevos batidos.', 10),
  (@recipe_tarta, 2, 2, 'Agregar el queso y volcar en molde para tarta.', 5),
  (@recipe_tarta, 3, 3, 'Hornear a 180° durante 30 minutos.', 30);
INSERT INTO image (idRecipe, id, imageUrl, isMain) VALUES
  (@recipe_tarta, 1, 'https://placehold.co/600x400/f9f3eb/4b6400?text=Tarta+de+verduras', 1);

-- 5.5 Guiso de lentejas (Carlos · Guisos y Sopas)
INSERT INTO recipe (idUser, name, description, preparationTime, difficulty, createdAt, saveCount)
VALUES (@user_carlos, 'Guiso de lentejas', 'Guiso abundante de lentejas con verduras.', 50, 'Media', DATE_SUB(NOW(), INTERVAL 15 DAY), 0);
SET @recipe_guiso := LAST_INSERT_ID();
INSERT INTO recipecategory (idRecipe, idCategory) VALUES (@recipe_guiso, @rc_guisos);
INSERT INTO recipeingredient (idRecipe, idIngredient, requiredQuantity) VALUES
  (@recipe_guiso, @ing_lentejas, 400), (@recipe_guiso, @ing_zanahoria, 150), (@recipe_guiso, @ing_cebolla, 100), (@recipe_guiso, @ing_papa, 200);
INSERT INTO step (idRecipe, id, stepNumber, instruction, estimatedTime) VALUES
  (@recipe_guiso, 1, 1, 'Remojar las lentejas la noche anterior.', 0),
  (@recipe_guiso, 2, 2, 'Rehogar cebolla, zanahoria y papa en cubos.', 10),
  (@recipe_guiso, 3, 3, 'Agregar las lentejas y agua, cocinar 40 minutos.', 40);
INSERT INTO image (idRecipe, id, imageUrl, isMain) VALUES
  (@recipe_guiso, 1, 'https://placehold.co/600x400/f9f3eb/4b6400?text=Guiso+de+lentejas', 1);

-- 5.6 Arroz con pollo (Carlos · Carnes)
INSERT INTO recipe (idUser, name, description, preparationTime, difficulty, createdAt, saveCount)
VALUES (@user_carlos, 'Arroz con pollo', 'Arroz cremoso con pollo y verduras salteadas.', 35, 'Media', DATE_SUB(NOW(), INTERVAL 2 DAY), 0);
SET @recipe_arrozpollo := LAST_INSERT_ID();
INSERT INTO recipecategory (idRecipe, idCategory) VALUES (@recipe_arrozpollo, @rc_carnes);
INSERT INTO recipeingredient (idRecipe, idIngredient, requiredQuantity) VALUES
  (@recipe_arrozpollo, @ing_arroz, 300), (@recipe_arrozpollo, @ing_pollo, 400), (@recipe_arrozpollo, @ing_zanahoria, 100);
INSERT INTO step (idRecipe, id, stepNumber, instruction, estimatedTime) VALUES
  (@recipe_arrozpollo, 1, 1, 'Saltear el pollo en cubos hasta dorar.', 10),
  (@recipe_arrozpollo, 2, 2, 'Agregar el arroz y la zanahoria, cocinar con caldo.', 25);
INSERT INTO image (idRecipe, id, imageUrl, isMain) VALUES
  (@recipe_arrozpollo, 1, 'https://placehold.co/600x400/f9f3eb/4b6400?text=Arroz+con+pollo', 1);

-- 5.7 Flan casero (Lucía · Postres)
INSERT INTO recipe (idUser, name, description, preparationTime, difficulty, createdAt, saveCount)
VALUES (@user_lucia, 'Flan casero', 'Flan casero con huevo y leche, bien cremoso.', 60, 'Media', DATE_SUB(NOW(), INTERVAL 12 DAY), 0);
SET @recipe_flan := LAST_INSERT_ID();
INSERT INTO recipecategory (idRecipe, idCategory) VALUES (@recipe_flan, @rc_postres);
INSERT INTO recipeingredient (idRecipe, idIngredient, requiredQuantity) VALUES
  (@recipe_flan, @ing_huevo, 4), (@recipe_flan, @ing_leche, 500);
INSERT INTO step (idRecipe, id, stepNumber, instruction, estimatedTime) VALUES
  (@recipe_flan, 1, 1, 'Batir los huevos con la leche y el azúcar.', 10),
  (@recipe_flan, 2, 2, 'Volcar en flanera acaramelada.', 5),
  (@recipe_flan, 3, 3, 'Cocinar a baño María durante 45 minutos.', 45);
INSERT INTO image (idRecipe, id, imageUrl, isMain) VALUES
  (@recipe_flan, 1, 'https://placehold.co/600x400/f9f3eb/4b6400?text=Flan+casero', 1);

-- 5.8 Ensalada de tomate y lechuga (Lucía · Ensaladas)
INSERT INTO recipe (idUser, name, description, preparationTime, difficulty, createdAt, saveCount)
VALUES (@user_lucia, 'Ensalada de tomate y lechuga', 'Ensalada simple y fresca para acompañar cualquier plato.', 10, 'Fácil', DATE_SUB(NOW(), INTERVAL 1 DAY), 0);
SET @recipe_ensaladasimple := LAST_INSERT_ID();
INSERT INTO recipecategory (idRecipe, idCategory) VALUES (@recipe_ensaladasimple, @rc_ensaladas);
INSERT INTO recipeingredient (idRecipe, idIngredient, requiredQuantity) VALUES
  (@recipe_ensaladasimple, @ing_tomate, 200), (@recipe_ensaladasimple, @ing_lechuga, 150), (@recipe_ensaladasimple, @ing_aceite, 20);
INSERT INTO step (idRecipe, id, stepNumber, instruction, estimatedTime) VALUES
  (@recipe_ensaladasimple, 1, 1, 'Cortar el tomate y la lechuga.', 5),
  (@recipe_ensaladasimple, 2, 2, 'Condimentar con sal, pimienta y aceite de oliva.', 2);
INSERT INTO image (idRecipe, id, imageUrl, isMain) VALUES
  (@recipe_ensaladasimple, 1, 'https://placehold.co/600x400/f9f3eb/4b6400?text=Ensalada+fresca', 1);

-- 5.9 Sopa de verduras (Martín · Guisos y Sopas)
INSERT INTO recipe (idUser, name, description, preparationTime, difficulty, createdAt, saveCount)
VALUES (@user_martin, 'Sopa de verduras', 'Sopa liviana de verduras de estación.', 30, 'Fácil', DATE_SUB(NOW(), INTERVAL 8 DAY), 0);
SET @recipe_sopa := LAST_INSERT_ID();
INSERT INTO recipecategory (idRecipe, idCategory) VALUES (@recipe_sopa, @rc_guisos);
INSERT INTO recipeingredient (idRecipe, idIngredient, requiredQuantity) VALUES
  (@recipe_sopa, @ing_zanahoria, 150), (@recipe_sopa, @ing_papa, 200), (@recipe_sopa, @ing_cebolla, 80);
INSERT INTO step (idRecipe, id, stepNumber, instruction, estimatedTime) VALUES
  (@recipe_sopa, 1, 1, 'Cortar todas las verduras en cubos chicos.', 10),
  (@recipe_sopa, 2, 2, 'Hervir en agua con sal hasta que estén tiernas.', 20);
INSERT INTO image (idRecipe, id, imageUrl, isMain) VALUES
  (@recipe_sopa, 1, 'https://placehold.co/600x400/f9f3eb/4b6400?text=Sopa+de+verduras', 1);

-- 5.10 Panqueques dulces (Martín · Postres)
INSERT INTO recipe (idUser, name, description, preparationTime, difficulty, createdAt, saveCount)
VALUES (@user_martin, 'Panqueques dulces', 'Panqueques clásicos con dulce de leche.', 20, 'Fácil', DATE_SUB(NOW(), INTERVAL 4 DAY), 0);
SET @recipe_panqueques := LAST_INSERT_ID();
INSERT INTO recipecategory (idRecipe, idCategory) VALUES (@recipe_panqueques, @rc_postres);
INSERT INTO recipeingredient (idRecipe, idIngredient, requiredQuantity) VALUES
  (@recipe_panqueques, @ing_harina, 200), (@recipe_panqueques, @ing_leche, 400), (@recipe_panqueques, @ing_huevo, 2);
INSERT INTO step (idRecipe, id, stepNumber, instruction, estimatedTime) VALUES
  (@recipe_panqueques, 1, 1, 'Mezclar la harina, la leche y los huevos hasta lograr una masa líquida.', 10),
  (@recipe_panqueques, 2, 2, 'Cocinar de a poco en sartén caliente con manteca.', 15);
INSERT INTO image (idRecipe, id, imageUrl, isMain) VALUES
  (@recipe_panqueques, 1, 'https://placehold.co/600x400/f9f3eb/4b6400?text=Panqueques', 1);

-- ---------------------------------------------------------------------
-- 6. Recetas guardadas + reseñas (para métricas: rating promedio, veces
--    guardada, recetas destacadas en el perfil). Una reseña necesita una
--    fila en userrecipe primero (relación real del modelo: review depende
--    de userrecipe, no de recipe directamente).
-- ---------------------------------------------------------------------

-- Milanesas con puré (Juan): guardada y reseñada por María y Carlos
INSERT INTO userrecipe (idUser, idRecipe, isSaved, savedAt) VALUES
  (@user_maria, @recipe_milanesas, 1, DATE_SUB(NOW(), INTERVAL 20 DAY)),
  (@user_carlos, @recipe_milanesas, 1, DATE_SUB(NOW(), INTERVAL 18 DAY));
INSERT INTO review (idUser, idRecipe, idReview, rating, comment, createdAt) VALUES
  (@user_maria, @recipe_milanesas, 1, 5.0, '¡Riquísimas, quedaron muy jugosas!', DATE_SUB(NOW(), INTERVAL 19 DAY)),
  (@user_carlos, @recipe_milanesas, 1, 4.5, 'Muy buena receta, el puré quedó perfecto.', DATE_SUB(NOW(), INTERVAL 17 DAY));
UPDATE recipe SET saveCount = 2 WHERE id = @recipe_milanesas;

-- Fideos con tuco (María): guardada y reseñada por Juan y Lucía
INSERT INTO userrecipe (idUser, idRecipe, isSaved, savedAt) VALUES
  (@user_juan, @recipe_fideos, 1, DATE_SUB(NOW(), INTERVAL 15 DAY)),
  (@user_lucia, @recipe_fideos, 1, DATE_SUB(NOW(), INTERVAL 10 DAY));
INSERT INTO review (idUser, idRecipe, idReview, rating, comment, createdAt) VALUES
  (@user_juan, @recipe_fideos, 1, 4.0, 'Salsa muy casera, buenísima.', DATE_SUB(NOW(), INTERVAL 14 DAY)),
  (@user_lucia, @recipe_fideos, 1, 5.0, 'La hice para toda la familia y encantó.', DATE_SUB(NOW(), INTERVAL 9 DAY));
UPDATE recipe SET saveCount = 2 WHERE id = @recipe_fideos;

-- Guiso de lentejas (Carlos): guardada y reseñada por Martín
INSERT INTO userrecipe (idUser, idRecipe, isSaved, savedAt) VALUES
  (@user_martin, @recipe_guiso, 1, DATE_SUB(NOW(), INTERVAL 12 DAY));
INSERT INTO review (idUser, idRecipe, idReview, rating, comment, createdAt) VALUES
  (@user_martin, @recipe_guiso, 1, 4.5, 'Ideal para un día de frío.', DATE_SUB(NOW(), INTERVAL 11 DAY));
UPDATE recipe SET saveCount = 1 WHERE id = @recipe_guiso;

-- Flan casero (Lucía): guardada y reseñada por Juan y María
INSERT INTO userrecipe (idUser, idRecipe, isSaved, savedAt) VALUES
  (@user_juan, @recipe_flan, 1, DATE_SUB(NOW(), INTERVAL 8 DAY)),
  (@user_maria, @recipe_flan, 1, DATE_SUB(NOW(), INTERVAL 6 DAY));
INSERT INTO review (idUser, idRecipe, idReview, rating, comment, createdAt) VALUES
  (@user_juan, @recipe_flan, 1, 5.0, 'El mejor flan casero que probé.', DATE_SUB(NOW(), INTERVAL 7 DAY)),
  (@user_maria, @recipe_flan, 1, 4.0, 'Muy cremoso, quedó perfecto.', DATE_SUB(NOW(), INTERVAL 5 DAY));
UPDATE recipe SET saveCount = 2 WHERE id = @recipe_flan;

-- Ensalada César (Juan): guardada (sin reseña) por Carlos, para ver el listón sin rating
INSERT INTO userrecipe (idUser, idRecipe, isSaved, savedAt) VALUES
  (@user_carlos, @recipe_cesar, 1, DATE_SUB(NOW(), INTERVAL 2 DAY));
UPDATE recipe SET saveCount = 1 WHERE id = @recipe_cesar;

-- ---------------------------------------------------------------------
-- 7. Inventario de ejemplo para Juan (para probar "Mi inventario")
-- ---------------------------------------------------------------------
INSERT INTO inventory (idUser, idIngredient, unitOfMeasure, availableQuantity) VALUES
  (@user_juan, @ing_tomate, 'g', 500),
  (@user_juan, @ing_cebolla, 'g', 300),
  (@user_juan, @ing_arroz, 'g', 1000),
  (@user_juan, @ing_huevo, 'unidad', 12),
  (@user_juan, @ing_aceite, 'ml', 750);

COMMIT;

-- =====================================================================
-- Listo. Quedaron cargados:
--   - 5 categorías de ingredientes + 18 ingredientes (con vínculo y
--     valores nutricionales para los más usados)
--   - 5 categorías de recetas
--   - 5 usuarios de prueba (contraseña Chefcito123 para todos):
--       juanperez, mariagomez, carlosdiaz, luciafernandez, martinlopez
--   - 10 recetas completas (imagen, categoría, ingredientes y pasos),
--     repartidas entre esos 5 usuarios
--   - Guardados + reseñas cruzadas entre usuarios, para ver ratings,
--     "recetas destacadas" y contador de guardados con datos reales
--   - Inventario de ejemplo para juanperez
--
-- Iniciá sesión como cualquiera de esos usuarios (o como tu propio admin)
-- para recorrer la home, "Mis recetas", "Recetas guardadas", el perfil
-- propio y el de otro usuario (tocando su nombre desde el detalle de una
-- receta), y el panel de admin para ver ingredientes/categorías/roles.
-- =====================================================================
