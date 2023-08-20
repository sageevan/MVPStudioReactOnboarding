import React, { Component } from 'react';
import { BsFillTrashFill, BsFillPencilFill } from "react-icons/bs";
import 'bootstrap/dist/css/bootstrap.min.css';
import $, { error } from 'jquery';
import { Popup, checkCurrencyFormat } from '../Utils';
import '../Components.css';

export class ProductList extends Component {
    static displayName = ProductList.name;

    constructor(props) {
        super(props);
        this.state = {
            createOpen: true, editOpen: false, deleteOpen: false,
            current: '', products: [],
            loading: true, editing: false,
            currentPage: 1, rowsPerPage: 5, totalProducts: 0,
            errorUser: false, errorServer: false, errorMessage: '', successMessage: ''
        };
    }

    //close popup window
    cancelPopup() {
        this.populateProductData(this.state.currentPage);
        this.setState({
            editOpen: false, createOpen: true, deleteOpen: false
        });
    }

    componentDidMount() {
        this.populateProductData(this.state.currentPage);
    }

    //Render the Products data from model to view
    renderProducts(data) {
        this.setState({ products: data, loading: true, editOpen: false, createOpen: true });
    }

    renderPagination(data) {
        const indexOfLast = this.state.currentPage * this.state.rowsPerPage;
        const indexOfFirst = indexOfLast - this.state.rowsPerPage;
        const currentData = data.slice(indexOfFirst, indexOfLast);
        this.setState({ totalProducts: data.length, products: currentData, loading: true });
    }

    //retrieve Product Details from controller
    async populateProductData(page) {
        $("#loading-error").hide();
        this.setState({ currentPage: page })
        fetch('/api/products')
            .then((res) => {
                if (!res.ok) {
                    this.setState({ errorServer: true })
                    throw error("There has been a problem with fetching Products!");
                }
                return res.json();
            })
            .then((data) => {
                $("#loading-error").hide();
                $("#loading").fadeOut(1000);
                this.renderPagination(data)
            })
            .catch(error => {
                $("#loading").fadeOut(1000);
                $("#loading-error").show();
                console.error(
                    'Could not connect server to get product details ' +
                    error.message
                );
            });

    }

     //Assign number of products per page when user select
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
                <p><label for="noOfProductsPerPage"></label>

                    <select name="noOfProductsPerPage" onChange={(e) => { this.noOfProductsPerPage(e.target.value) }}>
                        <option>5</option>
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                    </select>

                    {
                        pages.map((page, index) => {
                            return <button key={index} onClick={() => { this.populateProductData(page) }}>{page}</button>
                        })
                    }
                </p>
            </div>
        )
    }

    //Handle errors for users
    userMessageHandler(message) {
        if (message == "#success-message") {
            $("#success-error").hide();
            $(message).show();
            $(message).fadeOut(2000);
        } else if (message == "#error-message") {
            $("#success-message").hide();
            $(message).show();
            $(message).fadeOut(2000);
        } else {
            $("#success-message").hide();
            $("#error-message").hide();
        }
    }

     //Get the product to be edited and render to edittable
    updateProduct(product) {
        this.setState({ editOpen: true, current: product, loading: true, createOpen: false, errorUser:false, errorServer: false })
    }

    //update current product or create new customer
    saveProduct(product) {
        if (product.name.length == 0 || product.price <= 0 || checkCurrencyFormat(product.price)) {
            this.setState({ errorUser: true});
        }
        else if (product.name && product.price) {
            if (product.name.match(/^[A-Za-z\s]*$/)) {
                fetch('/api/products', {
                    method: 'POST',
                    headers: new Headers({
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }),
                    body: JSON.stringify(product)
                })
                    .then((res) => {
                        if (!res.ok) {
                            if ((res.status == 500)) {
                                this.setState({ errorMessage: 'Product Already Avaialable!' })
                                this.userMessageHandler("#error-message");
                                console.error("Product Already available to update/add!");
                                                            }
                            } else {
                            if (product.id > 0) {
                                this.setState({ successMessage: 'Product Details Successfully Updated!' });
                                this.userMessageHandler("#success-message");
                            } else {
                                this.setState({ successMessage: 'Product Details Successfully Created!' });
                                this.userMessageHandler("#success-message");
                            }
                        } 
                        return res.json();
                    })

                    .then((data) => {
                        this.setState({ loading: true, editOpen: false, createOpen: true })
                        this.populateProductData(this.state.currentPage);
                    })
                    .catch(error => {
                        this.setState({ errorServer: true })
                        console.error(
                            'Could not connect to the server for update/add product request' + '' +
                            error.message
                        );
                    });
            }else {
                console.error("Letters or special charactors found in product price!");
                this.setState({ errorUser: true });
            }
        }
    }

    //request to delete a product
    deleteProductRequest(product) {
        this.setState({ current: product, deleteOpen: true, loading: true, createOpen: true,errorUser:false, errorServer: false })
    }

    //after the confirmation from user, delete the product
    deleteProduct(product) {
        fetch('/api/products/' + product.id, {
            method: 'DELETE',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(product)
        })

            .then(res => {
                if (res.ok) {

                    this.setState({ successMessage: 'Product Deleted Successfully!', loading: true, editOpen: false, createOpen: true, deleteOpen: false })
                    this.populateProductData(this.state.currentPage);
                    this.userMessageHandler("#success-message");
                }
                else {
                    if ((res.status == 500)) {
                        this.setState({ errorMessage: 'Product already been deleted!' })
                        this.userMessageHandler("#error-message");
                        this.cancelPopup();
                        throw error('Product has been already deleted');
                    }
                    else {
                        this.setState({ errorServer: true, editOpen: false })
                        throw error("Could not connect to the server for deleting product!");
                    }
                }
            })
            .catch(error => {
                this.setState({ errorServer: true })
                console.error(
                    error.message
                );
            });

    }


    //Empty fields for create new product
    createProduct() {
        this.setState({
            createOpen: false,
            editOpen: true,
            errorUser: false,
            errorServer:false,
            loading: true,
            current: {
                productId: 0,
                name: '',
                price: ''
            }
        })
    }

    //Render product table for view
    static renderProductTable(products, currentProduct, ctrl, editPopup, deletePopup, error) {
        return (
            <table className='table table-striped' aria-labelledby="tabelLabel">
                <div id="loading" className="loading">Loading Products....</div>
                <div id="loading-error" className="loading-error">Failed to Load Products! check server connection.</div>
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
                               {/* <td>{new Intl.NumberFormat().format(product.price)}</td>*/}
                                <td>{((product.price).toFixed(2).replace(',', '.').replace(/\B(?=(\d{3})+(?!\d))/g, "."))}</td>
                                <td><button className="btn-edit" onClick={() => { ctrl.updateProduct(product) }}><BsFillPencilFill /></button></td>
                                <td><button className="btn-delete" onClick={() => { ctrl.deleteProductRequest(product) }}><BsFillTrashFill /></button></td>
                            </tr>
                        )}
                    </tbody>


                {editPopup && (
                    <Popup trigger={editPopup}>
                        <table className='table table-striped' aria-labelledby="tabelLabel">

                            <thead>
                                <tr>
                                    <th className="popup-title">Product Details</th>

                                </tr>
                                {ctrl.state.errorServer
                                    ? <div className="error">Server Connection failed!</div> : ""}
                            </thead>
                            <tbody>
                                <tr key={currentProduct.id}>
                                    <td>
                                        <p> <input type="hidden" value={currentProduct.id} name="productId" /></p>
                                        <p><label> Product Name : </label>
                                        <input type="text" placeholder="Enter Product Name" defaultValue={currentProduct.name} contentEditable name="name" onChange={(event) => { currentProduct.name = event.target.value; }} />
                                            {error && currentProduct.name.length <= 0 ?
                                                    <label className="error">Name cannot be empty* </label> : ""}
                                                {error && currentProduct.name.length >= 0 && !currentProduct.name.match(/^[A-Za-z\s]*$/)
                                                    ? <label className="error">Name cannot contains numbers or Special Charactors* </label> : ""}
                                            </p>
                                            <p><label>Product Price($) :</label>
                                        <input type="text" placeholder="Enter Product Price" defaultValue={currentProduct.price} name="price" onChange={(event) => { currentProduct.price = event.target.value; }} />
                                            {error && currentProduct.price <= 0 ?
                                                <label className="error">Price value cannot be $0*</label> : ""}
                                            {error && checkCurrencyFormat(currentProduct.price)
                                                ? <label className="error">Enter the Currency format(00.00)* </label> : ""}
                                            
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
                                {ctrl.state.errorServer
                                    ? <div className="error">Server Connection failed!</div> : ""}
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
                </table>
        );
    }

    render() {
        let contents = this.state.loading
            ? ProductList.renderProductTable(this.state.products, this.state.current, this, this.state.editOpen, this.state.deleteOpen, this.state.errorUser)
            : ProductList.pagination();


        return (
            <div>
                <div className="content-title">
                    <h3 >Product Details</h3></div>
                <hr></hr>
                {<div>      < div id="success-message" className="success-message" > {this.state.successMessage}</div >
                    <div id="error-message" className="error-message">{this.state.errorMessage}</div></div>}
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
