import React, { Component } from 'react';
import { BsFillTrashFill, BsFillPencilFill } from "react-icons/bs";
import { Modal, Button, Row, Column, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery'
import Popup from '../Popup';
import './Components.css';
 
export class CustomerList extends Component {
    static displayName = CustomerList.name;

    constructor(props) {
        super(props);
        this.state = {
            showmodal: false, current: '', customers: [], loading: true, editing: false
        };

    }

    componentDidMount() {
        this.populateCustomerData();
    }

    //Render the Customer data from model to view
    renderCustomers(data) {
          this.setState({ customers: data, loading: true });
    }

    //Get Customer Details from Model
    populateCustomerData() {
        $.ajax({
            url: '/api/Customers',
            type: 'GET',
            dataType: 'json',
            success: (ajaxResult) => {
                this.renderCustomers(ajaxResult);
            },
            error: (error) => function (request, message, error) {
                this.handleException(request, message, error)
            }
        });

    }
    //Get the cutomer to be edited and render to edittable
    updateCustomer(editcustomer) {
    
        this.setState({ current: editcustomer, showmodal:true, editing: true })
    }
    handleModal() {
        this.Popup.trigger = false;
    }
    saveCustomer(customer) {
        console.log(customer);
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
                    this.setState({ editing: false, loading: true })
                },
                (error) => {
                    alert("Failed");
                }
            );
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
    static renderCustomerTable(customers, ctrl) {
          return (
            <div className="container">
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
                                <td><button className="btn-delete" onClick={() => { ctrl.deleteCustomer(customer) }}><BsFillTrashFill /></button></td>
                            </tr>
                        )}
                      </tbody>
                      <table className='table table-striped' aria-labelledby="tabelLabel"></table>
                  </table>
                </div>
        );

    }
    //render edittable view for the clicked cutomer
    static renderCurrentCustomer(customer,ctrl) {
        console.log("sha");
        return (
            <Popup trigger={true}>
                <table className='table table-striped' aria-labelledby="tabelLabel">

                    <thead>
                        <tr>
                            <th>Customer Details {customer.name}</th>

                        </tr>
                    </thead>
                    <tbody>
                        <tr key={customer.id}>
                            <td>
                                <p> <input type="hidden" value={customer.id} name="customerId" /></p>
                                <p><label name="cus-name">Customer Name &nbsp;&nbsp;  : &nbsp; </label>
                                    <input type="text" defaultValue={customer.name} contentEditable name="name" onChange={(event) => { customer.name = event.target.value; }} /> </p>
                                <p><label name="cus-name">Customer Address : &nbsp; </label>
                                    <input type="text" defaultValue={customer.address} name="address" onChange={(event) => { customer.address = event.target.value; }} /> </p>
                                <td><input type="button" onClick={() => { ctrl.saveCustomer(customer) }} value="Save" /></td>
                                <td><input type="button" onClick={() => { ctrl.handleModal() }} value="Cancel" /></td>
                            </td>
                        </tr>
                    </tbody>

                    </table>
            </Popup>
           );
    }
    render() {
        let contents = this.state.loading
            ? CustomerList.renderCustomerTable(this.state.customers, this)
            : CustomerList.pagination();

        contents = this.state.editing
            ? CustomerList.renderCurrentCustomer(this.state.current, this)
            : CustomerList.renderCustomerTable(this.state.customers, this);
        return (
            <div>
                <div className="table-title">
                    <h3 >Customer Details</h3></div>
                {contents}
            </div>

        );
    }

}