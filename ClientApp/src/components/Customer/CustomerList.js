import React, { Component } from 'react';
import { BsFillTrashFill, BsFillPencilFill } from "react-icons/bs";
import 'bootstrap/dist/css/bootstrap.min.css';
import $, { error } from 'jquery';
import { Popup } from '../Utils';
import '../Components.css';

export class CustomerList extends Component {
    static displayName = CustomerList.name;

    constructor(props) {
        super(props);
        this.state = {
            createOpen: true, editOpen: false, deleteOpen: false,
            current: '', customers: [],
            loading: true, editing: false,
            currentPage: 1, rowsPerPage: 5, totalCustomers: 0,
            errorUser: false, errorServer: false, errorMessage: '', successMessage: ''
        };
    }

    //close popup window
    cancelPopup() {
        this.populateCustomerData(this.state.currentPage);
        this.setState({
            editOpen: false, createOpen: true, deleteOpen: false
        });
    }

    componentDidMount() {
        this.populateCustomerData(this.state.currentPage);
    }

    //Render the Customers data from model to view
    renderCustomers(data) {
        this.setState({ customers: data, loading: true, editOpen: false, createOpen: true });
    }

    //Processing Pagination
    renderPagination(data) {
        const indexOfLast = this.state.currentPage * this.state.rowsPerPage;
        const indexOfFirst = indexOfLast - this.state.rowsPerPage;
        const currentData = data.slice(indexOfFirst, indexOfLast);
        this.setState({ totalCustomers: data.length, customers: currentData, loading: true });
    }

    //Retrieve Customer Details from Controller
    async populateCustomerData(page) {
        $("#loading-error").hide();
        this.setState({ currentPage: page })
        fetch('/api/Customers')
            .then((res) => {
                if (!res.ok) {
                    if (res.status == 404) {
                        this.setState({ errorServer: true })
                        throw error("Empty List of Customers!");
                    }
                    else {
                        this.setState({ errorServer: true })
                        throw error("There has been a problem with fetching Customers!");
                    }
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
                    'Could not connect server to get customer details '+
                    error.message
                );
            });

    }

    //Assign number of customers per page when user select
    noOfCustomersPerPage(noofcustomersperpage) {
        this.setState({ rowsPerPage: noofcustomersperpage, loading: true })
        this.populateCustomerData(this.state.currentPage);
    }

    //pagination implementation
    pagination() {
        let pages = [];
        for (let i = 1; i <= Math.ceil(this.state.totalCustomers / this.state.rowsPerPage); i++) {
            pages.push(i);
        }
        return (

            <div className="pagination">
                <p><label for="noOfCustomersPerPage"></label>

                    <select name="noOfCustomersPerPage" onChange={(e) => { this.noOfCustomersPerPage(e.target.value) }}>
                        <option>5</option>
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                    </select>

                    {
                        pages.map((page, index) => {
                            return <button key={index} onClick={() => { this.populateCustomerData(page) }}>{page}</button>
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


    //Get the customer to be edited and render to edittable
    updateCustomer(customer) {
        this.setState({ editOpen: true, current: customer, loading: true, createOpen: false, errorServer: false })
    }

    //update current customer or create new customer
    saveCustomer(customer) {
        if (customer.name.length == 0 || customer.address.length == 0) {
            this.setState({ errorUser: true });
        }
        if (customer.name && customer.address) {
            if (customer.name.match(/^[A-Za-z\s]*$/)) {
                fetch('/api/Customers', {
                    method: 'post',
                    headers: new Headers({
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }),
                    body: JSON.stringify(customer)
                })
                    .then((res) => {
                        if (!res.ok) {
                            if ((res.status == 500)) {
                                this.setState({ errorMessage: 'Customer Already Avaialable!' })
                                this.userMessageHandler("#error-message");
                                console.error("Customer Already available to update/add!");
                            }
                            
                        } else {
                            if (customer.id > 0) {
                                this.setState({ successMessage: 'Customer Details Successfully Updated!' });
                                this.userMessageHandler("#success-message");
                            } else {
                                this.setState({ successMessage: 'Customer Details Successfully Created!' });
                                this.userMessageHandler("#success-message");
                            }
                        }
                        return res.json();
                    })


                    .then((data) => {
                        this.setState({loading: true, editOpen: false, createOpen: true })
                        this.populateCustomerData(this.state.currentPage);
                    })
                    .catch(error => {
                        this.setState({ errorServer: true })
                        console.error(
                            'Could not connect to the server for update/add customer request'+''+
                            error.message
                        );
                    });

            } else {
                console.error("Number or special charactors found in customer name!");
                this.setState({ errorUser: true });
            }
        }

    }
    //request to delete a customer 
    deleteCustomerRequest(customer) {
        this.setState({ current: customer, deleteOpen: true, loading: true, createOpen: true, errorServer: false })
    }

    //if confirmed by user then delete the customer
    deleteCustomer(customer) {
        fetch('/api/Customers/' + customer.id, {
            method: 'DELETE',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(customer)
        })

            .then(res => {
                if (res.ok) {

                    this.setState({ successMessage: 'Customer Deleted Successfully!', loading: true, editOpen: false, createOpen: true, deleteOpen: false })
                    this.populateCustomerData(this.state.currentPage);
                    this.userMessageHandler("#success-message");
                }
                else {
                    if ((res.status == 404)) {
                        this.setState({ errorMessage: 'Customer already been deleted!' })
                        this.userMessageHandler("#error-message");
                        this.cancelPopup();
                        throw error('Customer has been already deleted');
                    }else if ((res.status == 500)) {
                        this.setState({ errorMessage: 'Customer involved in sale cannot be deleted!' })
                        this.userMessageHandler("#error-message");
                        this.cancelPopup();
                        throw error('Customer involved in sale cannot be deleted!');
                    }
                    else {
                        this.setState({ errorServer: true, editOpen: false })
                        throw error('Could not connect to the server for delete customer request');
                    }
                }
            })
            .catch(error => {
                console.error(                    
                    error.message
                );
            });

    }


    //Empty fields for create new customer
    createCustomer() {
        this.setState({
            createOpen: false,
            editOpen: true,
            errorUser: false,
            errorServer: false,
            loading: true,
            current: {
                customerId: 0,
                name: '',
                address: ''
            }
        })
    }

    //Render customer table for view
    static renderCustomerTable(customers, currentCustomer, ctrl, editPopup, deletePopup, error) {
         return (
            
            <table className='table table-striped' aria-labelledby="tabelLabel">
                <div id="loading" className="loading">Loading Customers....</div>
                 <div id="loading-error" className="loading-error">Failed to Load Customers! check server connection Or empty data.</div>
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

                {editPopup && (
                    <Popup trigger={editPopup}>
                        <table className='table table-striped' aria-labelledby="tabelLabel">

                            <thead>
                                <tr>
                                    <th className="popup-title">Customer Details</th>
                                 </tr>
                                
                                {ctrl.state.errorServer
                                     ? <div className="error">Server Connection failed!</div> : ""}
                                 
                            </thead>
                            <tbody>
                                <tr key={currentCustomer.id}>
                                    <td>
                                        <p> <input type="hidden" value={currentCustomer.id} name="customerId" /></p>
                                        <p><label> Customer Name : </label>
                                            <input type="text" placeholder="Enter Customer Name" defaultValue={currentCustomer.name} contentEditable name="name" onChange={(event) => { currentCustomer.name = event.target.value; }} />
                                            {error && currentCustomer.name.length <= 0
                                                ? <label className="error">Name cannot be empty* </label> : ""}
                                            {error && currentCustomer.name.length >= 0 && !currentCustomer.name.match(/^[A-Za-z\s]*$/)
                                                ? <label className="error">Name cannot contains numbers or Special Charactors* </label> : ""}
                                        </p>
                                        <p><label>Customer Address :</label>
                                            <input type="text" placeholder="Enter Customer Address" defaultValue={currentCustomer.address} name="address" onChange={(event) => { currentCustomer.address = event.target.value; }} />
                                            {error && currentCustomer.address.length <= 0 ?
                                                <label className="error">Address Cannot be empty*</label> : ""}
                                        </p>
                                        <div className="btn-submit">
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
                                 {ctrl.state.errorServer
                                     ? <div className="error">Server Connection failed!</div> : ""}
                                 <tr>
                                     <th className="delete-confirm">Do you want to delete the customer : {currentCustomer.name}</th>

                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><div className="delete-btn-submit">
                                        <td><button onClick={() => { ctrl.deleteCustomer(currentCustomer) }}>Yes</button></td>
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
            ? CustomerList.renderCustomerTable(this.state.customers, this.state.current, this, this.state.editOpen, this.state.deleteOpen, this.state.errorUser)
            : CustomerList.pagination();


        return (
            <div>
                <div className="content-title">
                    <h2 >Customer Details</h2></div>
                
                <hr></hr>
                {<div>< div id="success-message" className="success-message" > {this.state.successMessage}</div >
                    <div id="error-message" className="error-message">{this.state.errorMessage}</div></div>}
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
