-- Configurar planos corretamente
INSERT INTO plan_configurations (name, plan_type, price, max_users, description) VALUES
  ('Bronze', 'bronze', 29.90, 1, 'Plano básico para estabelecimentos pequenos'),
  ('Prata', 'prata', 49.90, 3, 'Plano intermediário para estabelecimentos médios'),
  ('Gold', 'gold', 79.90, 10, 'Plano premium para estabelecimentos grandes')
ON CONFLICT (plan_type) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  max_users = EXCLUDED.max_users,
  description = EXCLUDED.description;