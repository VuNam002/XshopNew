import LayoutDefault from "../layout/layoutDefault/index";
import LayoutAuth from "../layout/LayoutAuth";
import Home from "../pages/client/Home";
import About from "../pages/client/About";
import Contact from "../pages/client/Contact";
import Error from "../pages/client/Error";
import ClientBlog from "../pages/client/Blog";
import BlogAll from "../pages/client/Blog/BlogAll";
import ProductAll from "../pages/client/product/ProductAll";
import ProductDetail from "../pages/client/product/ProductDetail";
import Login from "../pages/admin/Login";
import PrivateRoute from "../components/PrivateRoutes";
import InfoUser from "../pages/client/InfoUser";
import Register from "../pages/admin/Register";
import LayoutAdmin from "../layout/LayoutAdmin";
import AdminDashboard from "../pages/admin/Dashboard";
import ProductsListPage from "../pages/admin/Product/index";
import CreateProduct from "../pages/admin/Product/create";
import UpdateProduct from "../pages/admin/Product/update";
import CategoryListPage from "../pages/admin/Category/index";
import CreateCategory from "../pages/admin/Category/create";
import UpdateCategory from "../pages/admin/Category/edit";
import UsersListPage from "../pages/admin/Register/see";
import EditUser from "../pages/admin/Register/edit";
import AdminBlog from "../pages/admin/Blog/index.jsx";
import CreateBlog from "../pages/admin/Blog/create.jsx";
import EditBlog from "../pages/admin/Blog/edit.jsx";
import BlogDetail from "../pages/client/Blog/BlogDetail.jsx";
import Cart from "../pages/client/Cart/Cart";
import CategoryBlog from "../pages/admin/CategoryBlog/index.jsx";
import CreateCategoryBlog from "../pages/admin/CategoryBlog/create.jsx";
import EditCategoryBlog from "../pages/admin/CategoryBlog/edit.jsx";



export const routes = [
  {
    path: "/",
    element: <LayoutDefault />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "about",
        element: <About />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "products",
        element: <ProductAll />,
      },
      {
        path: "blog",
        element: <ClientBlog />,
        children: [
          { index: true, element: <BlogAll /> },
          { path: ":id", element: <BlogDetail /> },
        ],
      },
      {
        path: "cart",
        element: <Cart />,
      },
      {
        path: "products/search",
        element: <ProductAll />,
      },
      {
        path: "products/:id",
        element: <ProductDetail />,
      },
      {
        element: <PrivateRoute />,
        children: [
          {
            path: "info-user",
            element: <InfoUser />,
          },
        ],
      },
      {
        path: "*",
        element: <Error />,
      },
    ],
  },
  {
    path: "admin",
    element: <PrivateRoute />, 
    children: [
      {
        element: <LayoutAdmin />, 
        children: [
          {
            index: true,
            element: <AdminDashboard />,
          },
          {
            path: "products",
            element: <ProductsListPage />,
          },
          {
            path: "products/create",
            element: <CreateProduct />,
          },
          {
            path: "products/update/:id",
            element: <UpdateProduct />,
          },
          {
            path: "category",
            element: <CategoryListPage />,
          },
          {
            path: "category/create",
            element: <CreateCategory />,
          },
          {
            path: "category/edit/:id",
            element: <UpdateCategory />,
          },
          {
            path: "users",
            element: <UsersListPage />,
          },
          {
            path: "users/edit/:id",
            element: <EditUser />,
          },
          {
            path: "blog",
            element: <AdminBlog />
          },
          {
            path: "blog/create",
            element: <CreateBlog />
          },
          {
            path:"blog/edit/:id",
            element: <EditBlog />
          },
          {
            path: "categoryBlog",
            element: <CategoryBlog />,
          },
          {
            path:"category-blog/create",
            element: <CreateCategoryBlog />
          },
          {
            path:"category-blog/edit/:id",
            element: <EditCategoryBlog />
          }
        ],
      },
    ],
  },
  {
    path: "auth",
    element: <LayoutAuth />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "register",
        element: <Register />,
      },
    ],
  },
];