export * from './role.entity';
export * from './permission.entity';

// 通过创建角色去分配权限
// 用户的权限会根据角色关联权限、以及默认权限得出
// 根据用户的权限，去得出所拥有的菜单

// todo：想办法建立权限与菜单的关联关系
