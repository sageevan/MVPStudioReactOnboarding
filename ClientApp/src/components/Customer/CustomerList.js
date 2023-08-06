import React, { Component } from 'react';
import { BsFillTrashFill, BsFillPencilFill } from "react-icons/bs";
import ReactDOM from 'react-dom';
import $ from 'jquery'

export class CustomerList extends Component {
    static displayName = CustomerList.name;

    constructor(props) {
        super(props);
        this.state = {
            show: true, current: '', customers: [], loading: true, editing: false
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
                                <td><button className="btn-edit" onClick={() => { ctrl.UpdateCustomer(customer) }}><BsFillPencilFill /></button></td>
                                <td><button className="btn-delete" onClick={() => { ctrl.DeleteCustomer(customer) }}><BsFillTrashFill /></button></td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );

    }

    render() {
        let contents;
        if (this.state.loading) {
            contents = CustomerList.renderCustomerTable(this.state.customers, this);
        }

        return (
            <div>
                <div className="table-title">
                    <h3 >Customer Details</h3></div>
                {contents}
            </div>

        );
    }

}