import React, { Component } from 'react';
import { BsFillTrashFill, BsFillPencilFill } from "react-icons/bs";
import { formatDate, Popup } from '../Utils'
import $, { error } from 'jquery';
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Components.css';

export class SaleList extends Component {
    static displayName = SaleList.name;

    constructor(props) {
        super(props);
        this.state = {
            customerNames: '', productNames: '', storeNames: '',
            createbtnshow: true, createOpen: false, editOpen: false, deleteOpen: false,
            current: '', sales: [],
            loading: true, editing: false,
            currentPage: 1, rowsPerPage: 5, totalSales: 0,
            errorUser: false, errorServer: false, errorMessage: '', successMessage: ''
        };
    }

    //close popup window
    cancelPopup() {
        this.populateSaleData(this.state.currentPage);
        this.setState({
            editOpen: false, createbtnshow: true, deleteOpen: false, createOpen:false
        });
    }


    componentDidMount() {
        this.populateSaleData(this.state.currentPage);
    }
    
    //Render the sales data from model to view
    renderSales(data) {
        this.setState({ sales: data, loading: true, editOpen: false, createbtnshow: true });
    }
     
     //Processing Pagination
    renderPagination(data) {
        const indexOfLast = this.state.currentPage * this.state.rowsPerPage;
        const indexOfFirst = indexOfLast - this.state.rowsPerPage;
        const currentData = data.slice(indexOfFirst, indexOfLast);
        this.setState({ totalSales: data.length, sales: currentData, loading: true });
    }

    async populateSaleData(page) {
        $("#loading-error").hide();
        this.setState({ currentPage: page })
        //Get method to retrieve data from Controller
        fetch('/api/sales')
            .then((res) => {
                if (!res.ok) {


                    this.setState({ errorServer: true })
                    throw error("There has been a problem with fetching Sales!");

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
                    'Could not connect server to get sales details ' +
                    error.message
                );
            });

        //Retrieve cutomer names, product names and store names for user to select from the list
        Promise.all([
            fetch('/api/Customers'),
            fetch('/api/products'),
            fetch('/api/stores')
        ]).then(async ([res1, res2, res3]) => {
            const customernames = await res1.json();
            const productnames = await res2.json();
            const storenames = await res3.json();
            this.setState({
                customerNames: customernames, productNames: productnames, storeNames: storenames, editOpen: false, loading: true, createbtnshow: true
            })
            if (!res1.ok || !res2.ok || !res3.ok) {
                this.setState({ errorServer: true })
                throw error("There has been a problem with fetching Customers, Products and Stores");
            }
        })
            .catch(error => {
                console.error(
                    "There has been a problem with retrieving data Customers, Products and Stores!",
                    error
                );
            })

    }

    noOfSalesPerPage(noofsalesperpage) {
        this.setState({ rowsPerPage: noofsalesperpage, loading: true })
        this.populateSaleData(this.state.currentPage);
    }

    //pagination implementation
    pagination() {
        let pages = [];
        for (let i = 1; i <= Math.ceil(this.state.totalSales / this.state.rowsPerPage); i++) {
            pages.push(i);
        }
        return (
            <div className="pagination">
                <p>

                    <select name="noOfSalesPerPage" onChange={(e) => { this.noOfSalesPerPage(e.target.value) }}>
                        <option>5</option>
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                    </select>

                    {
                        pages.map((page, index) => {
                            return <button key={index} onClick={() => { this.populateSaleData(page) }}>{page}</button>
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

    //set select to edit sale
    updateSale(sale) {
        this.setState({
            editOpen: true, current: sale, loading: true, createbtnshow: false, errorServer: false
        })
    }
        
    
     //update current sale or create new sale
    saveSale(sale) {
        if (sale.productId == '' || sale.customerId == '' || sale.storeId == '') {
            this.setState({ errorUser: true });
        }
        else if (sale) {
            fetch('/api/sales', {
                method: 'post',
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify(sale)
            })
                .then((res) => {
                    if (res.ok) {
                        if (sale.id > 0) {
                            this.setState({ successMessage: 'Sale Details Successfully Updated!' });
                            this.userMessageHandler("#success-message");
                        } else {
                            this.setState({ successMessage: 'Sale Details Successfully Created!' });
                            this.userMessageHandler("#success-message");
                        }
                    }
                    return res.json();
                })
                .then((data) => {
                    this.setState({ loading: true, editOpen: false, createbtnshow: true, createOpen: false })
                    this.populateSaleData(this.state.currentPage);
                })
                .catch(error => {
                    this.setState({ errorServer: true })
                    console.error(
                        'Could not connect to the server for update/add sale request' + '' +
                        error.message
                    );
                });
        } else {
            console.error("Customer name or product name or store name cant be null for a sale");
            this.setState({ errorUser: true });
        }
        
    }

    //request to delete a sale
    deleteSaleRequest(sale) {
        this.setState({ current: sale, deleteOpen: true, loading: true, createbtnshow: true, errorServer: false })
    }

    //if confirmed by user then delete the sale
    deleteSale(sale) {
        fetch('/api/sales/' + sale.id, {
            method: 'DELETE',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(sale)
        })

            .then(res => {
                if (res.ok) {

                    this.setState({ successMessage: 'Customer Deleted Successfully!', loading: true, editOpen: false, createbtnshow: true, deleteOpen: false })
                    this.populateSaleData(this.state.currentPage);
                    this.userMessageHandler("#success-message");
                }
                else {
                    if ((res.status == 500)) {
                        this.setState({ errorMessage: 'Sale already been deleted!' })
                        this.userMessageHandler("#error-message");
                        this.cancelPopup();
                        throw error('Sale has been already deleted');
                    }
                    else {
                        this.setState({ errorServer: true, editOpen: false, createOpen:false })
                        throw error('Could not connect to the server for delete sale request');
                    }
                }
            })
            .catch(error => {
                console.error(
                    error.message
                );
            });
    }

    //Empty fields for create new sale
    createSale() {
        let currentDate = new Date();
        this.setState({
            createbtnshow: false,
            createOpen:true,
            editOpen: false,
            errorServer: false,
            errorUser:false,
            loading: true,
            current: {
                id: 0,
                productName: '',
                productId : '',
                customerName: '',
                customerId: '',
                storeName: '',
                storeId: '',
                dateSold: currentDate
            }
        })
    }

    //Render customer table for view
    static renderSaleTable(customerNames, productNames, storeNames, sales, currentSale, ctrl,createPopup, editPopup, deletePopup,error) {
        return (
            <div>
                <table className='table table-striped' aria-labelledby="tabelLabel">
                    <div id="loading" className="loading">Loading Sales....</div>
                    <div id="loading-error" className="loading-error">Failed to Load Sales! check server connection.</div>
                    <thead>
                        <tr>
                            <th>Customer</th>
                            <th>Product</th>
                            <th>Store</th>
                            <th>Date Sold</th>
                            <th>Actions</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sales?.map(sale =>
                            <tr key={sale.id}>
                                <td>{sale.customerName}</td>
                                <td>{sale.productName}</td>
                                <td>{sale.storeName}</td>
                                <td>{formatDate(new Date(sale.dateSold))}</td>
                                <td><button className="btn-edit" onClick={() => { ctrl.updateSale(sale) }}><BsFillPencilFill /></button></td>
                                <td><button className="btn-delete" onClick={() => { ctrl.deleteSaleRequest(sale) }}><BsFillTrashFill /></button></td>
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
                                    <th className="popup-title">Sale Details</th>

                                </tr>
                                {ctrl.state.errorServer
                                    ? <div className="error">Server Connection failed!</div> : ""}
                            </thead>
                            <tbody className="sale-edit-add">
                                <tr key={currentSale.id}>
                                    <td>
                                        <p> <input type="hidden" value={currentSale.id} name="id" /></p>
                                        <p><select className="customerName" defaultValue={currentSale.customerId} onChange={(e) => { currentSale.customerId = e.target.value }}>
                                            {customerNames?.map(c => (<option value={c.id} key={c.id}>{c.name}</option>))}
                                        </select> </p>
                                        <p><select name="productName" defaultValue={currentSale.productId} onChange={(e) => { currentSale.productId = e.target.value }}>
                                            {productNames?.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}
                                        </select> </p>
                                        <p><select name="storeName" defaultValue={currentSale.storeId} onChange={(e) => { currentSale.storeId = e.target.value }}>
                                            {storeNames?.map(s => <option value={s.id} key={s.id}>{s.name}</option>)}
                                        </select> </p>
                                        <p><input type="date" defaultValue={formatDate(new Date(currentSale.dateSold))} name="dateSold" onChange={(e) => { currentSale.dateSold = e.target.value; }}></input> </p>

                                        <div className="btn-submit">
                                            <button onClick={() => { ctrl.saveSale(currentSale) }}>Save</button>
                                            <button onClick={() => { ctrl.cancelPopup() }}>Cancel</button></div>

                                    </td>
                                </tr>
                            </tbody>

                        </table>
                    </Popup>
                )}

                {createPopup && (
                    <Popup trigger={createPopup}>
                        <table className='table table-striped' aria-labelledby="tabelLabel">

                            <thead>
                                <tr>
                                    <th className="popup-title">Sale Details</th>

                                </tr>
                                {ctrl.state.errorServer
                                    ? <div className="error">Server Connection failed!</div> : ""}
                            </thead>
                            <tbody className=" sale-edit-add">
                                <tr key={currentSale.id}>
                                    <td>
                                        <p> <input type="hidden" value={currentSale.id} name="id" /></p>
                                        <p><select className="customerId" onChange={(e) => { currentSale.customerId = e.target.value }}>
                                            <option defaultValue hidden>
                                                {'Select Customer'}
                                            </option>
                                            {customerNames?.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
                                        </select>
                                            {error && currentSale.customerId == '' ?
                                                <label className="error">Select Customer Name*</label>:''}
                                        </p>
                                        <p><select name="productId" onChange={(e) => { currentSale.productId = e.target.value }}>
                                            <option defaultValue hidden>
                                                {'Select Product'}
                                            </option>
                                            {productNames?.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}
                                        </select>{error && currentSale.productId == '' ?
                                                <label className="error">Select Product Name*</label> : ''}
                                        </p>
                                        <p><select name="storeId" onChange={(e) => { currentSale.storeId = e.target.value }}>
                                            <option defaultValue hidden>
                                                {'Select Store'}
                                            </option>
                                            {storeNames?.map(s => <option value={s.id} key={s.id}>{s.name}</option>)}
                                        </select> {error && currentSale.storeId == '' ?
                                                <label className="error">Select Store Name*</label> : ''}
                                        </p>

                                        <div className="btn-submit">
                                            <button onClick={() => { ctrl.saveSale(currentSale) }}>Save</button>
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
                                    <th className="delete-confirm">Do you want to delete selected sale </th>

                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><div className="delete-btn-submit">
                                        <td><button onClick={() => { ctrl.deleteSale(currentSale) }}>Yes</button></td>
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
            ? SaleList.renderSaleTable(this.state.customerNames, this.state.productNames, this.state.storeNames, this.state.sales, this.state.current, this, this.state.createOpen, this.state.editOpen, this.state.deleteOpen, this.state.errorUser)
            : SaleList.pagination();


        return (
            <div>
                <div className="table-title">
                    <h3 >Sales Details</h3></div>
                <hr></hr>
                {<div>< div id="success-message" className="success-message" > {this.state.successMessage}</div >
                    <div id="error-message" className="error-message">{this.state.errorMessage}</div></div>}
                {contents}
                {this.state.createbtnshow ?
                    <button className="btn-create-new" onClick={() => { this.createSale() }}>Create New</button>
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
