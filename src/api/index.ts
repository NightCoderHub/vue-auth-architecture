/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface User {
  /** 用户ID */
  id: number;
  /** 用户名 */
  username: string;
  /** 真实姓名 */
  name: string;
}

export interface Role {
  /** 角色ID */
  id: number;
  /** 角色名称 */
  name: string;
  /** 角色描述 */
  description?: string;
}

export interface Product {
  /** 商品ID */
  id: number;
  /** 商品名称 */
  name: string;
  /** 价格 */
  price: number;
  /** 库存数量 */
  stock: number;
  /** 状态 (active/inactive) */
  status: string;
}

export interface MenuItem {
  /** 菜单 ID */
  id: number;
  /** 父级菜单 ID */
  parentId?: number | null;
  /** 路由路径 */
  path: string;
  /** 路由名称 (PascalCase) */
  name: string;
  /** 组件路径 (Layout/ParentView/views路径) */
  component: string;
  /** 路由重定向 */
  redirect?: string;
  /** 菜单标题 */
  title: string;
  /** 菜单图标 (Element Plus 图标名) */
  icon?: string;
  /**
   * 是否需要登录授权
   * @default true
   */
  requiresAuth?: boolean;
  /**
   * 是否隐藏面包屑
   * @default false
   */
  hideBreadcrumb?: boolean;
  /**
   * 是否启用
   * @default true
   */
  enabled?: boolean;
  /**
   * 是否隐藏
   * @default false
   */
  hidden?: boolean;
  /** 高亮菜单项的路径 */
  activeMenu?: string;
  /**
   * 是否开启缓存
   * @default false
   */
  keepAlive?: boolean;
  /** 权限标识数组 */
  permissions?: string[];
  /** 菜单类型 (0:目录, 1:菜单, 2:按钮) */
  type?: 0 | 1 | 2;
  /** 排序号 */
  sort?: number;
  /**
   * 是否固定在 TagsView
   * @default false
   */
  affix?: boolean;
  /**
   * 是否全屏显示
   * @default false
   */
  fullScreen?: boolean;
  /**
   * 总是显示根菜单
   * @default true
   */
  alwaysShow?: boolean;
  /** 外部链接 */
  externalLink?: string;
  /** 内嵌 Iframe 地址 */
  frameSrc?: string;
  /** 子菜单列表 */
  children?: MenuItem[];
}

export interface Error {
  /** @example 400 */
  code: number;
  /** 错误信息描述 */
  message: string;
  /** @example null */
  data: object | null;
}

import type {
  AxiosInstance,
  AxiosRequestConfig,
  HeadersDefaults,
  ResponseType,
} from "axios";
import axiosInstance from "../axios/index";

export type QueryParamsType = Record<string | number, any>;

export type HttpResponse<T, E = any> = T extends { data?: infer U } ? U : T;

export interface FullRequestParams
  extends Omit<AxiosRequestConfig, "data" | "params" | "url" | "responseType"> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean;
  /** request path */
  path: string;
  /** content type of request body */
  type?: ContentType;
  /** query params */
  query?: QueryParamsType;
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseType;
  /** request body */
  body?: unknown;
}

export type RequestParams = Omit<
  FullRequestParams,
  "body" | "method" | "query" | "path"
>;

export interface ApiConfig<SecurityDataType = unknown>
  extends Omit<AxiosRequestConfig, "data" | "cancelToken"> {
  securityWorker?: (
    securityData: SecurityDataType | null,
  ) => Promise<AxiosRequestConfig | void> | AxiosRequestConfig | void;
  secure?: boolean;
  format?: ResponseType;
}

export enum ContentType {
  Json = "application/json",
  JsonApi = "application/vnd.api+json",
  FormData = "multipart/form-data",
  UrlEncoded = "application/x-www-form-urlencoded",
  Text = "text/plain",
}

export class HttpClient<SecurityDataType = unknown> {
  public instance: AxiosInstance;
  private securityData: SecurityDataType | null = null;
  private securityWorker?: ApiConfig<SecurityDataType>["securityWorker"];
  private secure?: boolean;
  private format?: ResponseType;

  constructor({
    securityWorker,
    secure,
    format,
    ...axiosConfig
  }: ApiConfig<SecurityDataType> = {}) {
    this.instance = axiosInstance;
    this.secure = secure;
    this.format = format;
    this.securityWorker = securityWorker;
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data;
  };

  protected mergeRequestParams(
    params1: AxiosRequestConfig,
    params2?: AxiosRequestConfig,
  ): AxiosRequestConfig {
    const method = params1.method || (params2 && params2.method);

    return {
      ...this.instance.defaults,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...((method &&
          this.instance.defaults.headers[
            method.toLowerCase() as keyof HeadersDefaults
          ]) ||
          {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {}),
      },
    };
  }

  protected stringifyFormItem(formItem: unknown) {
    if (typeof formItem === "object" && formItem !== null) {
      return JSON.stringify(formItem);
    } else {
      return `${formItem}`;
    }
  }

  protected createFormData(input: Record<string, unknown>): FormData {
    if (input instanceof FormData) {
      return input;
    }
    return Object.keys(input || {}).reduce((formData, key) => {
      const property = input[key];
      const propertyContent: any[] =
        property instanceof Array ? property : [property];

      for (const formItem of propertyContent) {
        const isFileType = formItem instanceof Blob || formItem instanceof File;
        formData.append(
          key,
          isFileType ? formItem : this.stringifyFormItem(formItem),
        );
      }

      return formData;
    }, new FormData());
  }

  public request = async <T = any, _E = any>({
    secure,
    path,
    type,
    query,
    format,
    body,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, _E>> => {
    const secureParams =
      ((typeof secure === "boolean" ? secure : this.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {};
    const requestParams = this.mergeRequestParams(params, secureParams);
    const responseFormat = format || this.format || undefined;

    if (
      type === ContentType.FormData &&
      body &&
      body !== null &&
      typeof body === "object"
    ) {
      body = this.createFormData(body as Record<string, unknown>);
    }

    if (
      type === ContentType.Text &&
      body &&
      body !== null &&
      typeof body !== "string"
    ) {
      body = JSON.stringify(body);
    }

    return this.instance
      .request({
        ...requestParams,
        headers: {
          ...(requestParams.headers || {}),
          ...(type ? { "Content-Type": type } : {}),
        },
        params: query,
        responseType: responseFormat,
        data: body,
        url: path,
      })
      .then((response) => response as any);
  };
}

/**
 * @title Node API Server Documentation
 * @version 1.0.0
 * @baseUrl http://localhost:3000/api
 * @contact API Support <support@example.com>
 *
 * API documentation for Node API Server. Generated automatically from source code comments.
 */
export class Api<
  SecurityDataType extends unknown,
> extends HttpClient<SecurityDataType> {
  auth = {
    /**
 * @description 用户通过用户名和密码进行登录，获取访问令牌(Access Token)和用户信息。刷新令牌(Refresh Token)将通过HttpOnly Cookie设置。
 *
 * @tags Auth
 * @name Login
 * @summary 用户登录
 * @request POST:/auth/login
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Success" *\
    message: string,
    data: {
  \** JWT访问令牌，用于后续请求认证 *\
    accessToken: string,
    user: User,

},

}` 登录成功
 * @response `401` `Error` 认证失败，用户名或密码错误
 */
    login: (
      data: {
        /**
         * 用户名
         * @example "admin"
         */
        username: string;
        /**
         * 密码
         * @example "password"
         */
        password: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Success" */
          message: string;
          data: {
            /** JWT访问令牌，用于后续请求认证 */
            accessToken: string;
            user: User;
          };
        },
        Error
      >({
        path: `/auth/login`,
        method: "POST",
        body: data,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
 * @description 使用Cookie中的Refresh Token换取新的Access Token。用于前端Access Token过期后的无感刷新。
 *
 * @tags Auth
 * @name Refresh
 * @summary 刷新令牌
 * @request POST:/auth/refresh
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Success" *\
    message: string,
    data: {
  \** 新的JWT访问令牌 *\
    accessToken: string,

},

}` 刷新成功
 * @response `401` `Error` Refresh Token缺失或无效
 * @response `403` `Error` Refresh Token已过期或被撤销
 */
    refresh: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Success" */
          message: string;
          data: {
            /** 新的JWT访问令牌 */
            accessToken: string;
          };
        },
        Error
      >({
        path: `/auth/refresh`,
        method: "POST",
        format: "json",
        ...params,
      }),

    /**
 * @description 清除服务端的Refresh Token记录（如果有），并通知客户端清除Cookie。
 *
 * @tags Auth
 * @name Logout
 * @summary 用户登出
 * @request POST:/auth/logout
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Logged out successfully" *\
    message: string,
  \** @example null *\
    data: object | null,

}` 登出成功
 */
    logout: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Logged out successfully" */
          message: string;
          /** @example null */
          data: object | null;
        },
        any
      >({
        path: `/auth/logout`,
        method: "POST",
        format: "json",
        ...params,
      }),
  };
  user = {
    /**
 * @description 获取当前登录用户的详细信息，包含角色列表。需要有效的Access Token。
 *
 * @tags User
 * @name GetProfile
 * @summary 获取个人资料
 * @request GET:/user/profile
 * @secure
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Success" *\
    message: string,
    data: (User & {
    roles: (Role)[],

}),

}` 获取成功
 * @response `401` `Error` 未授权，Token无效或过期
 */
    getProfile: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Success" */
          message: string;
          data: User & {
            roles: Role[];
          };
        },
        Error
      >({
        path: `/user/profile`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
 * @description 根据用户角色的权限，获取动态菜单 tree 结构。用于前端生成左侧菜单栏。
 *
 * @tags User
 * @name GetMenus
 * @summary 获取用户菜单
 * @request GET:/user/menus
 * @secure
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Success" *\
    message: string,
  \** 菜单树结构 *\
    data: (MenuItem)[],

}` 获取成功
 * @response `401` `Error` 未授权，Token无效或过期
 */
    getMenus: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Success" */
          message: string;
          /** 菜单树结构 */
          data: MenuItem[];
        },
        Error
      >({
        path: `/user/menus`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
 * @description 获取当前用户拥有的所有权限标识符列表（如 'user:view', 'role:edit'）。用于前端按钮级别的权限控制。
 *
 * @tags User
 * @name GetPermissions
 * @summary 获取用户权限码
 * @request GET:/user/permissions
 * @secure
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Success" *\
    message: string,
    data: (string)[],

}` 获取成功
 * @response `401` `Error` 未授权，Token无效或过期
 */
    getPermissions: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Success" */
          message: string;
          data: string[];
        },
        Error
      >({
        path: `/user/permissions`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  users = {
    /**
 * @description 获取系统中所有用户的列表。需要 'user:view' 权限。
 *
 * @tags User
 * @name GetAllUsers
 * @summary 获取用户列表
 * @request GET:/users
 * @secure
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Success" *\
    message: string,
    data: (User)[],

}` 获取成功
 * @response `403` `Error` 权限不足
 */
    getAllUsers: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Success" */
          message: string;
          data: User[];
        },
        Error
      >({
        path: `/users`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
 * @description 创建一个新的系统用户。需要 'user:add' 权限。
 *
 * @tags User
 * @name CreateUser
 * @summary 创建新用户
 * @request POST:/users
 * @secure
 * @response `201` `{
  \** @example 201 *\
    code: number,
  \** @example "User created successfully" *\
    message: string,
    data: User,

}` 创建成功
 * @response `400` `Error` 参数错误
 */
    createUser: (
      data: {
        /** 用户名 */
        username: string;
        /** 初始密码 */
        password: string;
        /** 真实姓名 */
        name?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 201 */
          code: number;
          /** @example "User created successfully" */
          message: string;
          data: User;
        },
        Error
      >({
        path: `/users`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
 * @description 根据ID获取特定用户的详细信息。需要 'user:view' 权限。
 *
 * @tags User
 * @name GetUserById
 * @summary 获取用户详情
 * @request GET:/users/{id}
 * @secure
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Success" *\
    message: string,
    data: User,

}` 获取成功
 * @response `404` `Error` 用户不存在
 */
    getUserById: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Success" */
          message: string;
          data: User;
        },
        Error
      >({
        path: `/users/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
 * @description 更新现有用户的基本信息。需要 'user:edit' 权限。
 *
 * @tags User
 * @name UpdateUser
 * @summary 更新用户信息
 * @request PUT:/users/{id}
 * @secure
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "User updated successfully" *\
    message: string,
    data: User,

}` 更新成功
 * @response `404` `Error` 用户不存在
 */
    updateUser: (
      id: number,
      data: {
        /** 真实姓名 */
        name?: string;
        /** 是否启用 */
        enabled?: boolean;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "User updated successfully" */
          message: string;
          data: User;
        },
        Error
      >({
        path: `/users/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
 * @description 删除指定ID的用户。需要 'user:delete' 权限。
 *
 * @tags User
 * @name DeleteUser
 * @summary 删除用户
 * @request DELETE:/users/{id}
 * @secure
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "User deleted successfully" *\
    message: string,
  \** @example null *\
    data: object | null,

}` 删除成功
 * @response `404` `Error` 用户不存在
 */
    deleteUser: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "User deleted successfully" */
          message: string;
          /** @example null */
          data: object | null;
        },
        Error
      >({
        path: `/users/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
 * @description 更新指定用户的角色列表。需要 'user:edit' 权限。
 *
 * @tags User
 * @name UpdateUserRoles
 * @summary 分配用户角色
 * @request PUT:/users/{id}/roles
 * @secure
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Roles updated successfully" *\
    message: string,
  \** @example null *\
    data: object | null,

}` 角色分配成功
 */
    updateUserRoles: (
      id: number,
      data: {
        /**
         * 角色ID数组
         * @example [1,2]
         */
        roleIds: number[];
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Roles updated successfully" */
          message: string;
          /** @example null */
          data: object | null;
        },
        any
      >({
        path: `/users/${id}/roles`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  roles = {
    /**
 * @description 获取系统中所有角色的列表。需要 'role:view' 权限。
 *
 * @tags Role
 * @name GetAllRoles
 * @summary 获取角色列表
 * @request GET:/roles
 * @secure
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Success" *\
    message: string,
    data: (Role)[],

}` 获取成功
 */
    getAllRoles: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Success" */
          message: string;
          data: Role[];
        },
        any
      >({
        path: `/roles`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
 * @description 创建一个新的系统角色。
 *
 * @tags Role
 * @name CreateRole
 * @summary 创建新角色
 * @request POST:/roles
 * @secure
 * @response `201` `{
  \** @example 201 *\
    code: number,
  \** @example "Role created successfully" *\
    message: string,
    data: Role,

}` 创建成功
 */
    createRole: (
      data: {
        /** 角色名称 */
        name: string;
        /** 角色描述 */
        description?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 201 */
          code: number;
          /** @example "Role created successfully" */
          message: string;
          data: Role;
        },
        any
      >({
        path: `/roles`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
 * @description 获取特定角色的详细信息。需要 'role:view' 权限。
 *
 * @tags Role
 * @name GetRoleById
 * @summary 获取角色详情
 * @request GET:/roles/{id}
 * @secure
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Success" *\
    message: string,
    data: Role,

}` 获取成功
 * @response `404` `Error` 角色不存在
 */
    getRoleById: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Success" */
          message: string;
          data: Role;
        },
        Error
      >({
        path: `/roles/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
 * @description 更新现有角色的基本信息。
 *
 * @tags Role
 * @name UpdateRole
 * @summary 更新角色信息
 * @request PUT:/roles/{id}
 * @secure
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Role updated successfully" *\
    message: string,
    data: Role,

}` 更新成功
 * @response `404` `Error` 角色不存在
 */
    updateRole: (
      id: number,
      data: {
        /** 角色名称 */
        name: string;
        /** 角色描述 */
        description?: string;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Role updated successfully" */
          message: string;
          data: Role;
        },
        Error
      >({
        path: `/roles/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
 * @description 删除指定角色。
 *
 * @tags Role
 * @name DeleteRole
 * @summary 删除角色
 * @request DELETE:/roles/{id}
 * @secure
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Role deleted successfully" *\
    message: string,
  \** @example null *\
    data: object | null,

}` 删除成功
 * @response `404` `Error` 角色不存在
 */
    deleteRole: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Role deleted successfully" */
          message: string;
          /** @example null */
          data: object | null;
        },
        Error
      >({
        path: `/roles/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
 * @description 更新指定角色的权限列表。
 *
 * @tags Role
 * @name UpdateRolePermissions
 * @summary 分配角色权限
 * @request PUT:/roles/{id}/permissions
 * @secure
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Permissions updated successfully" *\
    message: string,
  \** @example null *\
    data: object | null,

}` 权限分配成功
 */
    updateRolePermissions: (
      id: number,
      data: {
        /** 权限ID数组 */
        permissionIds: number[];
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Permissions updated successfully" */
          message: string;
          /** @example null */
          data: object | null;
        },
        any
      >({
        path: `/roles/${id}/permissions`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
 * @description 更新指定角色的菜单列表。
 *
 * @tags Role
 * @name UpdateRoleMenus
 * @summary 分配角色菜单
 * @request PUT:/roles/{id}/menus
 * @secure
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Menus updated successfully" *\
    message: string,
  \** @example null *\
    data: object | null,

}` 菜单分配成功
 */
    updateRoleMenus: (
      id: number,
      data: {
        /** 菜单ID数组 */
        menuIds: number[];
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Menus updated successfully" */
          message: string;
          /** @example null */
          data: object | null;
        },
        any
      >({
        path: `/roles/${id}/menus`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
  menus = {
    /**
 * @description 获取系统中所有菜单的列表。
 *
 * @tags Menu
 * @name GetAllMenus
 * @summary 获取所有菜单列表
 * @request GET:/menus
 * @secure
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Success" *\
    message: string,
    data: (MenuItem)[],

}` 获取成功
 */
    getAllMenus: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Success" */
          message: string;
          data: MenuItem[];
        },
        any
      >({
        path: `/menus`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
 * @description 创建一个新的菜单项。
 *
 * @tags Menu
 * @name CreateMenu
 * @summary 新增菜单
 * @request POST:/menus
 * @secure
 * @response `201` `{
  \** @example 201 *\
    code: number,
  \** @example "Menu created successfully" *\
    message: string,
    data: MenuItem,

}` 创建成功
 * @response `400` `Error` 参数错误或重复
 */
    createMenu: (
      data: {
        /** 菜单标题 */
        title: string;
        /** 菜单路径 */
        path: string;
        /** 菜单名称 */
        name: string;
        /** 组件路径 */
        component?: string;
        /** 菜单图标 */
        icon?: string;
        /** 排序序号 */
        sort?: number;
        /** 父菜单ID（如果是子菜单） */
        parentId?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 201 */
          code: number;
          /** @example "Menu created successfully" */
          message: string;
          data: MenuItem;
        },
        Error
      >({
        path: `/menus`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
 * @description 根据ID获取菜单详情。
 *
 * @tags Menu
 * @name GetMenuById
 * @summary 获取菜单详情
 * @request GET:/menus/{id}
 * @secure
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Success" *\
    message: string,
    data: MenuItem,

}` 获取成功
 * @response `404` `Error` 菜单不存在
 */
    getMenuById: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Success" */
          message: string;
          data: MenuItem;
        },
        Error
      >({
        path: `/menus/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
 * @description 更新现有菜单信息。
 *
 * @tags Menu
 * @name UpdateMenu
 * @summary 更新菜单
 * @request PUT:/menus/{id}
 * @secure
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Menu updated successfully" *\
    message: string,
    data: MenuItem,

}` 更新成功
 * @response `404` `Error` 菜单不存在
 */
    updateMenu: (
      id: number,
      data: {
        /** 菜单标题 */
        title?: string;
        /** 菜单路径 */
        path?: string;
        /** 菜单图标 */
        icon?: string;
        /** 排序序号 */
        sort?: number;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Menu updated successfully" */
          message: string;
          data: MenuItem;
        },
        Error
      >({
        path: `/menus/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
 * @description 删除指定菜单。注意：如果存在子菜单则无法删除。
 *
 * @tags Menu
 * @name DeleteMenu
 * @summary 删除菜单
 * @request DELETE:/menus/{id}
 * @secure
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Menu deleted successfully" *\
    message: string,
  \** @example null *\
    data: object | null,

}` 删除成功
 * @response `400` `Error` 存在子菜单无法删除
 * @response `404` `Error` 菜单不存在
 */
    deleteMenu: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Menu deleted successfully" */
          message: string;
          /** @example null */
          data: object | null;
        },
        Error
      >({
        path: `/menus/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  products = {
    /**
 * @description 获取所有商品的列表。
 *
 * @tags Product
 * @name GetAllProducts
 * @summary 获取商品列表
 * @request GET:/products
 * @secure
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Success" *\
    message: string,
    data: (Product)[],

}` 获取成功
 */
    getAllProducts: (params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Success" */
          message: string;
          data: Product[];
        },
        any
      >({
        path: `/products`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
 * @description 创建新的商品记录。
 *
 * @tags Product
 * @name CreateProduct
 * @summary 创建商品
 * @request POST:/products
 * @secure
 * @response `201` `{
  \** @example 201 *\
    code: number,
  \** @example "Product created successfully" *\
    message: string,
    data: Product,

}` 创建成功
 * @response `400` `Error` 参数错误
 */
    createProduct: (data: Product, params: RequestParams = {}) =>
      this.request<
        {
          /** @example 201 */
          code: number;
          /** @example "Product created successfully" */
          message: string;
          data: Product;
        },
        Error
      >({
        path: `/products`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
 * @description 根据ID获取商品详情。
 *
 * @tags Product
 * @name GetProductById
 * @summary 获取商品详情
 * @request GET:/products/{id}
 * @secure
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Success" *\
    message: string,
    data: Product,

}` 获取成功
 * @response `404` `Error` 商品不存在
 */
    getProductById: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Success" */
          message: string;
          data: Product;
        },
        Error
      >({
        path: `/products/${id}`,
        method: "GET",
        secure: true,
        format: "json",
        ...params,
      }),

    /**
 * @description 更新现有商品信息。
 *
 * @tags Product
 * @name UpdateProduct
 * @summary 更新商品
 * @request PUT:/products/{id}
 * @secure
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Product updated successfully" *\
    message: string,
    data: Product,

}` 更新成功
 * @response `404` `Error` 商品不存在
 */
    updateProduct: (id: number, data: Product, params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Product updated successfully" */
          message: string;
          data: Product;
        },
        Error
      >({
        path: `/products/${id}`,
        method: "PUT",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),

    /**
 * @description 删除指定商品。
 *
 * @tags Product
 * @name DeleteProduct
 * @summary 删除商品
 * @request DELETE:/products/{id}
 * @secure
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Product deleted successfully" *\
    message: string,
  \** @example null *\
    data: object | null,

}` 删除成功
 * @response `404` `Error` 商品不存在
 */
    deleteProduct: (id: number, params: RequestParams = {}) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Product deleted successfully" */
          message: string;
          /** @example null */
          data: object | null;
        },
        Error
      >({
        path: `/products/${id}`,
        method: "DELETE",
        secure: true,
        format: "json",
        ...params,
      }),
  };
  permissions = {
    /**
 * @description 手动触发权限变更事件，用于测试或强制刷新客户端权限状态。
 *
 * @tags Permission
 * @name TriggerPermissionChange
 * @summary 触发权限变更通知
 * @request POST:/permissions/change
 * @secure
 * @response `200` `{
  \** @example 200 *\
    code: number,
  \** @example "Success" *\
    message: string,
    data: {
  \** @example true *\
    triggered: boolean,
  \** 发送给客户端的事件负载 *\
    payload: {
    userId: number,
    type: string,

},

},

}` 触发成功
 * @response `400` `Error` 请求参数错误 (缺少 userId 或 type)
 * @response `403` `Error` 权限不足 (需要 'role:edit' 权限)
 */
    triggerPermissionChange: (
      data: {
        /**
         * 目标用户ID (Required) - 权限发生变更的用户
         * @example 1
         */
        userId: number;
        /**
         * 变更类型标识符 (Required) - 如 'user_role_update'
         * @example "user_role_update"
         */
        type: string;
        /**
         * 变更前的数据快照 (Optional)
         * @example {"roles":[1]}
         */
        before?: object;
        /**
         * 变更后的数据快照 (Optional)
         * @example {"roles":[1,2]}
         */
        after?: object;
      },
      params: RequestParams = {},
    ) =>
      this.request<
        {
          /** @example 200 */
          code: number;
          /** @example "Success" */
          message: string;
          data: {
            /** @example true */
            triggered: boolean;
            /** 发送给客户端的事件负载 */
            payload: {
              userId: number;
              type: string;
            };
          };
        },
        Error
      >({
        path: `/permissions/change`,
        method: "POST",
        body: data,
        secure: true,
        type: ContentType.Json,
        format: "json",
        ...params,
      }),
  };
}
