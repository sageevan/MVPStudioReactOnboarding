import React, { Component } from 'react';
import { BsFillTrashFill, BsFillPencilFill } from "react-icons/bs";
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery'
import Popup from '../Popup';
import './Components.css';
 
export class CustomerList extends Component {
    static displayName = CustomerList.name;

    constructor(props) {
        super(props);
        this.state = { isOpen: false, current: '', customers: [], loading: true, editing: false };
    }

    cancelPopup() {
        console.log("sha");
        this.populateCustomerData();
        this.setState({
            isOpen: false
        });


    }

    componentDidMount() {
        this.populateCustomerData();
    }

    //Render the Customer data from model to view
    renderCustomers(data) {
          this.setState({ customers: data, loading: true, isOpen:false});
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
    updateCustomer(customer) {

        this.setState({isOpen:true, current:customer, loading: true })
    }

    saveCustomer(customer) {
        console.log("sha");
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
                    this.populateCustomerData()
                    this.setState({ editing: false, loading: true,isOpen:false })
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
    static renderCustomerTable(customers,currentCustomer, ctrl,popup) {
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
                              <td><button className="btn-delete" onClick={() => { ctrl.deleteCustomer(customer) }}><BsFillTrashFill /></button></td>
                            </tr>
                      )}
                    </tbody>
                    <table className='table table-striped' aria-labelledby="tabelLabel"></table>
                </table>


                {popup && (
                    <Popup trigger={popup}>
                        <table className='table table-striped' aria-labelledby="tabelLabel">

                            <thead>
                                <tr>
                                    <th>Customer Details {currentCustomer.name}</th>

                                </tr>
                            </thead>
                            <tbody>
                                 <tr key={currentCustomer.id}>
                                    <td>
                                        <p> <input type="hidden" value={currentCustomer.id} name="customerId" /></p>
                                        <p><label name="cus-name">Customer Name &nbsp;&nbsp;  : &nbsp; </label>
                                            <input type="text" defaultValue={currentCustomer.name} contentEditable name="name" onChange={(event) => { currentCustomer.name = event.target.value; }} /> </p>
                                        <p><label name="cus-name">Customer Address : &nbsp; </label>
                                            <input type="text" defaultValue={currentCustomer.address} name="address" onChange={(event) => { currentCustomer.address = event.target.value; }} /> </p>
                                        <td><input type="button" value="Save" onClick={() => { ctrl.saveCustomer(currentCustomer) }} /></td>
                                        <td><input type="button" value="Cancel" onClick={() => { ctrl.cancelPopup() }} /></td>
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
            ? CustomerList.renderCustomerTable(this.state.customers,this.state.current, this, this.state.isOpen)
            : CustomerList.pagination();

        //contents = this.state.editing
        //    ? CustomerList.renderCurrentCustomer(this.state.current, this)
        //    : CustomerList.renderCustomerTable(this.state.customers, this);
        return (
            <div>
                <div className="table-title">
                    <h3 >Customer Details</h3></div>
                {contents}
            </div>

        );
    }

}
