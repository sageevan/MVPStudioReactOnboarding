import React, { Component } from 'react';
import { BsFillTrashFill, BsFillPencilFill } from "react-icons/bs";
import { formatDate, Popup } from '../Utils'
import 'bootstrap/dist/css/bootstrap.min.css';
import '../Components.css';

export class SaleList extends Component {
    static displayName = SaleList.name;

    constructor(props) {
        super(props);
        this.state = { customerNames: '', productNames :'', storeNames:'',createbtnshow:true, createOpen: false, editOpen: false, deleteOpen: false, current: '', sales: [], loading: true, editing: false, currentPage: 1, rowsPerPage: 5, totalSales: 0, error: false };
    }

    //close popup window
    cancelPopup() {
        //e.preventDefault();
        this.populateSaleData(this.state.currentPage);
        this.setState({
            editOpen: false, createbtnshow: true, deleteOpen: false, createOpen:false
        });
    }


    componentDidMount() {
        this.populateSaleData(this.state.currentPage);
    }
    renderSales(data) {
        this.setState({ sales: data, loading: true, editOpen: false, createbtnshow: true });
    }
    renderPagination(data) {
        const indexOfLast = this.state.currentPage * this.state.rowsPerPage;
        const indexOfFirst = indexOfLast - this.state.rowsPerPage;
        const currentData = data.slice(indexOfFirst, indexOfLast);
        this.setState({ totalSales: data.length, sales: currentData, loading: true });
    }

    async populateSaleData(page) {
        this.setState({ currentPage: page })
        //Get method to retrieve data from Controller
        fetch('/api/sales')
            .then((res) => res.json())
            .then((data) => {
                this.renderPagination(data)
            })
            .catch(error => {
                console.error(
                    "There has been a problem with your fetch operation for Get Customer List!",
                    error.message
                );
            });

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
                <p><label for="noOfSalesPerPage">Number of Sales in a page :&nbsp;</label>

                    <select name="noOfSalesPerPage" onChange={(e) => { this.noOfSalesPerPage(e.target.value) }}>
                        <option>5</option>
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                    </select>

                    <br></br>
                    {
                        pages.map((page, index) => {
                            return <button key={index} onClick={() => { this.populateSaleData(page) }}>{page}</button>
                        })
                    }
                </p>
            </div>
        )
    }

    updateSale(sale) {
        this.setState({
            editOpen: true, current: sale, loading: true, createbtnshow: false
        })
    }
        
    

    saveSale(sale) {
        if (sale) {
            fetch('/api/sales', {
                method: 'post',
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify(sale)
            })
                .then((res) => res.json())
                .then((data) => {
                    this.setState({ loading: true, editOpen: false, createbtnshow: true, createOpen: false })
                    this.populateSaleData(this.state.currentPage);
                })
                .catch(error => {
                    console.error(
                        "There has been a problem with your fetch operation for updating Customer!",
                        error
                    );
                });
        }
    }

    deleteSaleRequest(sale) {
        this.setState({ current: sale, deleteOpen: true, loading: true, createbtnshow: true })
    }

    deleteSale(sale) {
        fetch('/api/sales/' + sale.id, {
            method: 'DELETE',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(sale)
        })

            .then(response => {
                this.setState({ loading: true, editOpen: false, createbtnshow: true, deleteOpen: false })
                this.populateSaleData(this.state.currentPage);
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
            })
            .catch(error => {
                console.error(
                    "There has been a problem with your fetch operation for updating Customer!",
                    error
                );
            });

    }

    createSale() {
        let currentDate = new Date();
        this.setState({
            createbtnshow: false,
            createOpen:true,
            editOpen: false,
            error: false,
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


    static renderSaleTable(customerNames, productNames, storeNames, sales, currentSale, ctrl,createPopup, editPopup, deletePopup, error) {
        return (
            <div>
                <table className='table table-striped' aria-labelledby="tabelLabel">
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
                            </thead>
                            <tbody>
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
                            </thead>
                            <tbody>
                                <tr key={currentSale.id}>
                                    <td>
                                        <p> <input type="hidden" value={currentSale.id} name="id" /></p>
                                        <p><select className="customerId" onChange={(e) => { currentSale.customerId = e.target.value }}>
                                            <option defaultValue hidden>
                                                {'Select Customer'}
                                            </option>
                                            {customerNames?.map(c => <option value={c.id} key={c.id}>{c.name}</option>)}
                                        </select> </p>
                                        <p><select name="productId" onChange={(e) => { currentSale.productId = e.target.value }}>
                                            <option defaultValue hidden>
                                                {'Select Product'}
                                            </option>
                                            {productNames?.map(p => <option value={p.id} key={p.id}>{p.name}</option>)}
                                        </select> </p>
                                        <p><select name="storeId" onChange={(e) => { currentSale.storeId = e.target.value }}>
                                            <option defaultValue hidden>
                                                {'Select Store'}
                                            </option>
                                            {storeNames?.map(s => <option value={s.id} key={s.id}>{s.name}</option>)}
                                        </select> </p>

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
                                <tr>
                                    <th>Do you want to delete details for sale : {currentSale.name}</th>

                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><div className="btn-submit">
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
            ? SaleList.renderSaleTable(this.state.customerNames, this.state.productNames, this.state.storeNames, this.state.sales, this.state.current, this, this.state.createOpen, this.state.editOpen, this.state.deleteOpen, this.state.error)
            : SaleList.pagination();


        return (
            <div>
                <div className="table-title">
                    <h3 >Sales Details</h3></div>
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
