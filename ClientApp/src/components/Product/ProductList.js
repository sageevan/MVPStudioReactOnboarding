import React, { Component } from 'react';
import { BsFillTrashFill, BsFillPencilFill } from "react-icons/bs";
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import Popup from '../Popup';
import '../Components.css';

export class ProductList extends Component {
    static displayName = ProductList.name;

    constructor(props) {
        super(props);
        this.state = { createOpen: true, editOpen: false, deleteOpen: false, current: '', products: [], loading: true, editing: false, currentPage: 1, rowsPerPage: 5, totalProducts: 0, error: false };
    }

    //close popup window
    cancelPopup() {
        //e.preventDefault();
        this.populateProductData(this.state.currentPage);
        this.setState({
            editOpen: false, createOpen: true, deleteOpen: false
        });
    }

    componentDidMount() {
        this.populateProductData(this.state.currentPage);
    }

    renderProducts(data) {
        this.setState({ products: data, loading: true, editOpen: false, createOpen: true });
    }

    renderPagination(data) {
        const indexOfLast = this.state.currentPage * this.state.rowsPerPage;
        const indexOfFirst = indexOfLast - this.state.rowsPerPage;
        const currentData = data.slice(indexOfFirst, indexOfLast);
        this.setState({ totalProducts: data.length, products: currentData, loading: true });
    }

    async  populateProductData(page) {
        this.setState({ currentPage: page})
        fetch('/api/products')
            .then((res) => res.json())
            .then((data) => {
                this.renderPagination(data);
            })
            .catch(error => {
                console.error(
                    "There has been a problem with your fetch operation for Get Customer List!",
                    error.message
                );
            });
            
            
        }

    
    noOfProductsPerPage(noofproductsperpage) {
        this.setState({ rowsPerPage: noofproductsperpage, loading: true })
        this.populateProductData(this.state.currentPage);
    }

    //pagination implementation
    pagination() {
        let pages = [];
        for (let i = 1; i <= Math.ceil(this.state.totalProducts / this.state.rowsPerPage); i++) {
            pages.push(i);
        }
        return (
            <div className="pagination">
                <p><label for="noOfProductsPerPage">Number of Products in a page :&nbsp;</label>

                    <select name="noOfProductsPerPage" onChange={(e) => { this.noOfProductsPerPage(e.target.value) }}>
                        <option>5</option>
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                    </select>

                    <br></br>
                    {
                        pages.map((page, index) => {
                            return <button key={index} onClick={() => { this.populateProductData(page) }}>{page}</button>
                        })
                    }
                </p>
            </div>
        )
    }
    updateProduct(product) {
        this.setState({ editOpen: true, current: product, loading: true, createOpen: false })
    }

    saveProduct(product) {
        console.log(product);
        if (product.name.length == 0 || product.price >= 0) {
            this.setState({ error: true });
        }
        if (product.name && product.price) {
            fetch('/api/products', {
                method: 'POST',
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify(product)
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);
                    this.setState({ loading: true, editOpen: false, createOpen: true })
                    this.populateProductData(this.state.currentPage);
                })
                .catch(error => {
                    console.error(
                        "There has been a problem with your fetch operation for updating Customer!",
                        error
                    );
                });
        }
    }
    deleteProductRequest(product) {
        this.setState({ current: product, deleteOpen: true, loading: true, createOpen: true })
    }
    deleteProduct(product) {
        fetch('/api/products/' + product.id, {
            method: 'DELETE',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(product)
        })

            .then(response => {
                this.setState({ loading: true, editOpen: false, createOpen: true, deleteOpen: false })
                this.populateProductData(this.state.currentPage);
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
            })
            .catch(error => {
                console.error(
                    "There has been a problem with your fetch operation for updating Product!",
                    error
                );
            });

   }
    createProduct() {
        this.setState({
            createOpen: false,
            editOpen: true,
            error: false,
            loading: true,
            current: {
                productId: 0,
                name: '',
                price: ''
            }
        })
    }

    static renderProductTable(products, currentProduct, ctrl, editPopup, deletePopup, error) {
        return (
            <div>
                <table className='table table-striped' aria-labelledby="tabelLabel">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Price($)</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products?.map(product =>
                            <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>{product.price}</td>
                                <td><button className="btn-edit" onClick={() => { ctrl.updateProduct(product) }}><BsFillPencilFill /></button></td>
                                <td><button className="btn-delete" onClick={() => { ctrl.deleteProductRequest(product) }}><BsFillTrashFill /></button></td>
                            </tr>
                        )}
                    </tbody>
                    <table className='table table-striped' aria-labelledby="tabelLabel"></table>
                </table>


                {editPopup && (
                    <Popup trigger={editPopup}>
                        <table className='table table-striped' aria-labelledby="tabelLabel">

                            <thead>
                                <tr>
                                    <th className="popup-title">Product Details</th>

                                </tr>
                            </thead>
                            <tbody>
                                <tr key={currentProduct.id}>
                                    <td>
                                        <p> <input type="hidden" value={currentProduct.id} name="productId" /></p>
                                        <p><input type="text" placeholder="Product Name" defaultValue={currentProduct.name} contentEditable name="name" onChange={(event) => { currentProduct.name = event.target.value; }} />
                                            {error && currentProduct.name.length <= 0 ?
                                                <label className="error">Name cannot be empty* </label> : ""}
                                        </p>
                                        <p><input type="text" placeholder="Product Price" defaultValue={currentProduct.price} name="price" onChange={(event) => { currentProduct.price = event.target.value; }} />
                                            {error && currentProduct.price.length <= 0 ?
                                                <label className="error">Price Cannot be empty*</label> : ""}
                                        </p>
                                        <div className="btn-submit">
                                            <button onClick={() => { ctrl.saveProduct(currentProduct) }}>Save</button>
                                            <button onClick={() => { ctrl.cancelPopup() }}>Cancel</button></div>

                                    </td>
                                </tr>
                            </tbody>

                        </table>
                    </Popup>
                )}

                {deletePopup && (
                    <Popup trigger={deletePopup}>
                        <table className='table table-striped' aria-labelledby="tabelLabel">

                            <thead>
                                <tr>
                                    <th>Do you want to delete product: {currentProduct.name}</th>

                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><div className="btn-submit">
                                        <td><button onClick={() => { ctrl.deleteProduct(currentProduct) }}>Yes</button></td>
                                        <td><button onClick={() => { ctrl.cancelPopup() }}>No</button></td></div>
                                    </td>
                                </tr>
                            </tbody>

                        </table>
                    </Popup>
                )}
            </div>
        );
    }

    render() {
        let contents = this.state.loading
            ? ProductList.renderProductTable(this.state.products, this.state.current, this, this.state.editOpen, this.state.deleteOpen, this.state.error)
            : ProductList.pagination();


        return (
            <div>
                <div className="table-title">
                    <h3 >Product Details</h3></div>
                {contents}
                {this.state.createOpen ?
                    <button className="btn-create-new" onClick={() => { this.createProduct() }}>Create New</button>
                    : null
                }
                {this.state.currentPage > 0 ?
                    this.pagination()
                    : null
                }
            </div>

        );
    }
}
