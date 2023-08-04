import { Home } from "./components/Home";
import { CustomerList } from "./components/Customer/CustomerList";
import { ProductList } from "./components/Product/ProductList";
import { StoreList } from "./components/Store/StoreList";
import { SaleList } from "./components/Sale/SaleList";

const AppRoutes = [
    {
        index: true,
        element: <Home />
    },
    {
        path: '/Customer/CustomerList',
        element: <CustomerList />
    },
    {
        path: '/Product/ProductList',
        element: <ProductList />
    },
    {
        path: '/Store/StoreList',
        element: <StoreList />
    },
    {
        path: '/Sale/SaleList',
        element: <SaleList />
    }
];

export default AppRoutes;
