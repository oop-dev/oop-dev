SELECT DISTINCT p.permission_name
FROM users u
    JOIN LATERAL unnest(u.roles) AS role_id ON true JOIN roles r ON r.id = role_id
    JOIN LATERAL unnest(r.permissions) AS permission_id ON true JOIN permissions p ON p.id = permission_id
WHERE u.id = 1;

一对多，多对多，
SELECT u.id AS user_id,
       u.username,
       jsonb_agg(jsonb_build_object(
               'role_name', r.role_name,
               'permissions', (SELECT jsonb_agg(jsonb_build_object(
                       'id', p.id,
                       'permission_name', p.permission_name))FROM unnest(r.permissions) AS permission_id JOIN permissions p ON p.id = permission_id))
       )AS roles
FROM users u JOIN unnest(u.roles) AS role_id ON true JOIN roles r ON r.id = role_id WHERE u.id = 1 GROUP BY u.id;


SELECT jsonb_build_object(
               'user_id', u.id,
               'username', u.username,
               'roles', jsonb_agg(
                       jsonb_build_object(
                               'role_name', r.role_name,
                               'permissions', (
                                   SELECT jsonb_agg(
                                                  jsonb_build_object(
                                                          'id', p.id,
                                                          'permission_name', p.permission_name
                                                  )
                                          )
                                   FROM unnest(r.permissions) AS permission_id
                                            JOIN permissions p ON p.id = permission_id
                               )
                       )
                        )
       ) AS user_info
FROM users u
         JOIN unnest(u.roles) AS role_id ON true
         JOIN roles r ON r.id = role_id
WHERE u.id = 1  -- 替换为实际的用户 ID
GROUP BY u.id, u.username;


一对一，多对一
SELECT jsonb_agg(u.id AS user_id,
       u.username,
       jsonb_agg(jsonb_build_object(
               'role_name', r.role_name,
               'permissions', (SELECT jsonb_agg(jsonb_build_object(
                       'id', p.id,
                       'permission_name', p.permission_name))FROM unnest(r.permissions) AS permission_id JOIN permissions p ON p.id = permission_id))
       )AS roles
           )
FROM merchant u JOIN `order` r ON r.merchant = merchant.id WHERE merchant.id = 1 GROUP BY merchant.id;




select orders.id,orders.name,orders.total,
       jsonb_build_object('id',users.id,'username',users.username,
                          'app',(select jsonb_build_object('id',app.id,'name',app.name) as app from app where app.users=users.id)
       )as users
from orders join users on orders.users = users.id where orders.id=7 group by orders.id,users.id


select orders.id,orders.name,orders.total,
       jsonb_build_object('id',users.id,'username',users.username,
                          'app', jsonb_build_object('id',app.id,'name',app.name) as app
       )as users
from orders
         join users on orders.users = users.id
         join app on app.users = users.id
where orders.id=7 group by orders.id,users.id,app.id
