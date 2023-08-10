import React, { Component } from 'react';
import { BsFillTrashFill, BsFillPencilFill } from "react-icons/bs";
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery'
import Popup from '../Popup';
import '../Components.css';

export class CustomerList extends Component {
    static displayName = CustomerList.name;

    constructor(props) {
        super(props);
        this.state = { createOpen: true, editOpen: false, deleteOpen: false, current: '', customers: [], loading: true, editing: false, currentPage: 1, noOfCustomersPerPage: 5, totalCustomers: 0, error: false };
    }

    //close popup window
    cancelPopup() {
        //e.preventDefault();
        this.populateCustomerData(this.state.currentPage);
        this.setState({
            editOpen: false, createOpen: true, deleteOpen: false
        });
    }

    componentDidMount() {
        this.populateCustomerData(this.state.currentPage);
    }

    //Render the Customer data from model to view
    renderCustomers(data) {
        this.setState({ customers: data, loading: true, editOpen: false, createOpen: true });
    }

    //Get Customer Details from Model
    populateCustomerData(page) {
        this.state.currentPage = page;
        $.ajax({
            url: '/api/Customers',
            type: 'GET',
            dataType: 'json',
            success: (ajaxResult) => {
                const indexOfLastCust = this.state.currentPage * this.state.noOfCustomersPerPage;
                const indexOfFirstCust = indexOfLastCust - this.state.noOfCustomersPerPage;
                const currentCustomers = ajaxResult.slice(indexOfFirstCust, indexOfLastCust);
                this.setState({ totalCustomers: ajaxResult.length, customers: currentCustomers, loading: true });
            },
            error: (error) => function (request, message, error) {
                this.handleException(request, message, error)
            }
        });

    }
    noOfCustomersPerPage(noofcustomersperpage) {
        this.setState({ noOfCustomersPerPage: noofcustomersperpage, loading: true })
        this.populateCustomerData(this.state.currentPage);
    }

    //pagination implementation
    pagination() {
        let pages = [];
        for (let i = 1; i <= Math.ceil(this.state.totalCustomers / this.state.noOfCustomersPerPage); i++) {
            pages.push(i);
        }
        return (
            <div className="pagination">
               <p><label for="noOfCustomersPerPage">Number of Customers in a page:</label>
                
                <select name="noOfCustomersPerPage" onChange={(e) => { this.noOfCustomersPerPage(e.target.value) }}>
                    <option>5</option>
                    <option>10</option>
                    <option>20</option>
                    <option>50</option>
                    </select>

                <br></br>
                {
                    pages.map((page, index) => {
                        return <button key={index} onClick={() => { this.populateCustomerData(page) }}>{page}</button>
                    })
                    }
                    </p>
            </div>
        )
    }

    //Get the cutomer to be edited and render to edittable
    updateCustomer(customer) {
        this.setState({ editOpen: true, current: customer, loading: true, createOpen: false })
    }

    //update current customer or create new customer
    saveCustomer(customer) {
        if (customer.name.length == 0 || customer.address.length == 0) {
            this.setState({ error: true });
        }
        if (customer.name && customer.address) {
            fetch('api/Customers', {
                method: 'post',
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify(customer)
            })
                .then(response => response.json())
                .then(
                    (result) => {
                        this.populateCustomerData(this.state.currentPage)
                        this.setState({ loading: true, editOpen: false, createOpen: true })
                    },
                    (error) => {
                        alert("Failed");
                    }
                );
        }
    }
    //request to delete a customer 
    deleteCustomerRequest(customer) {
        this.setState({ current: customer, deleteOpen: true, loading: true, createOpen: true })
    }

    //if confirmed by user then delete the customer
    deleteCustomer(customer) {
        $.ajax({
            url: '/api/Customers/' + customer.id,
            type: 'DELETE',
            dataType: 'json',
            success: (ajaxResult) => {
                this.populateCustomerData(this.state.currentPage)
                this.setState({ loading: true, editOpen: false, createOpen: true, deleteOpen: false })
            },
            error: (error) => function (request, message, error) {
                this.handleException(request, message, error)
            }
        });
    }

    //Empty fields for create new customer
    createCustomer() {
        this.setState({
            cretaOpen: false,
            editOpen: true,
            error: false,
            loading: true,
            current: {
                customerId: 0,
                name: '',
                address: ''
            }
        })
    }

    //Handle exception from Ajax Call
    static handleException(request, message, error) {
        var msg = "";

        msg += "Code: " + request.status + "\n";
        msg += "Text: " + request.statusText + "\n";
        if (request.responseJSON != null) {
            msg += "Message: " +
                request.responseJSON.Message + "\n";
        }

        alert(msg);
    }
    //Render cutomer table for view
    static renderCustomerTable(customers, currentCustomer, ctrl, editPopup, deletePopup, error) {
        return (
            <div>
                <table className='table table-striped' aria-labelledby="tabelLabel">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Address</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customers?.map(customer =>
                            <tr key={customer.id}>
                                <td>{customer.name}</td>
                                <td>{customer.address}</td>
                                <td><button className="btn-edit" onClick={() => { ctrl.updateCustomer(customer) }}><BsFillPencilFill /></button></td>
                                <td><button className="btn-delete" onClick={() => { ctrl.deleteCustomerRequest(customer) }}><BsFillTrashFill /></button></td>
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
                                    <th className="popup-title">Customer Details</th>

                                </tr>
                            </thead>
                            <tbody>
                                <tr key={currentCustomer.id}>
                                    <td>
                                        <p> <input type="hidden" value={currentCustomer.id} name="customerId" /></p>
                                        <p><input type="text" placeholder="Customer Name" defaultValue={currentCustomer.name} contentEditable name="name" onChange={(event) => { currentCustomer.name = event.target.value; }} />
                                            {error && currentCustomer.name.length <= 0 ?
                                                <label className="error">Name cannot be empty* </label> : ""}
                                        </p>
                                        <p><input type="text" placeholder="Customer Address" defaultValue={currentCustomer.address} name="address" onChange={(event) => { currentCustomer.address = event.target.value; }} />
                                            {error && currentCustomer.address.length <= 0 ?
                                                <label className="error">Address Cannot be empty*</label> : ""}
                                        </p>
                                        <div className="submit-btn">
                                            <button onClick={() => { ctrl.saveCustomer(currentCustomer) }}>Save</button>
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
                                    <th>Do you want to delete details for customer : {currentCustomer.name}</th>

                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><div className="submit-btn">
                                        <td><input type="button" value="Yes" onClick={() => { ctrl.deleteCustomer(currentCustomer) }} /></td>
                                        <td><input type="button" value="No" onClick={() => { ctrl.cancelPopup() }} /></td></div>
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
            ? CustomerList.renderCustomerTable(this.state.customers, this.state.current, this, this.state.editOpen, this.state.deleteOpen, this.state.error)
            : CustomerList.pagination();


        return (
            <div>
                <div className="table-title">
                    <h3 >Customer Details</h3></div>
                {contents}
                {this.state.createOpen ?
                    <button className="btn-create-new" onClick={() => { this.createCustomer() }}>Create New</button>
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
