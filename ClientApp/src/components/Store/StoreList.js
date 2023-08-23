import React, { Component } from 'react';
import { BsFillTrashFill, BsFillPencilFill } from "react-icons/bs";
import 'bootstrap/dist/css/bootstrap.min.css';
import $, { error } from 'jquery';
import {Popup} from '../Utils';
import '../Components.css';

export class StoreList extends Component {
    static displayName = StoreList.name;

    constructor(props) {
        super(props);
        this.state = {
            createOpen: true, editOpen: false, deleteOpen: false,
            current: '', stores: [],
            loading: true, editing: false,
            currentPage: 1, rowsPerPage: 5, totalStores: 0,
            errorUser: false, errorServer: false, errorMessage: '', successMessage: ''
        };
    }

    componentDidMount() {
        this.populateStoreData(this.state.currentPage);
    }
    //close popup window
    cancelPopup() {
        this.populateStoreData(this.state.currentPage);
        this.setState({
            editOpen: false, createOpen: true, deleteOpen: false
        });
    }

    //Render the Stores data from model to view
    renderStores(data) {
        this.setState({ stores: data, loading: true, editOpen: false, createOpen: true });
    }

    //Processing Pagination
    renderPagination(data) {
        const indexOfLast = this.state.currentPage * this.state.rowsPerPage;
        const indexOfFirst = indexOfLast - this.state.rowsPerPage;
        const currentData = data.slice(indexOfFirst, indexOfLast);
        this.setState({ totalStores: data.length, stores: currentData, loading: true });
    }

    //Retrieve Store Details from Controller
    async populateStoreData(page) {
        $("#loading-error").hide();
        this.setState({ currentPage: page })

        fetch('/api/stores')
            .then((res) => {
                if (!res.ok) {


                    this.setState({ errorServer: true })
                    throw error("There has been a problem with fetching Stores!");

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
                    'Could not connect server to get store details ' +
                    error.message
                );
            });

    }

    //Assign number of stores per page when user select
    noOfStoresPerPage(noofstoresperpage) {
        this.setState({ rowsPerPage: noofstoresperpage, loading: true })
        this.populateStoreData(this.state.currentPage);
    }

    //pagination implementation
    pagination() {
        let pages = [];
        for (let i = 1; i <= Math.ceil(this.state.totalStores / this.state.rowsPerPage); i++) {
            pages.push(i);
        }
        return (
            <div className="pagination">
                <p><label for="noOfStoresPerPage"></label>

                    <select name="noOfStoresPerPage" onChange={(e) => { this.noOfStoresPerPage(e.target.value) }}>
                        <option>5</option>
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                    </select>
                    {
                        pages.map((page, index) => {
                            return <button key={index} onClick={() => { this.populateStoreData(page) }}>{page}</button>
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

    //Get the store to be edited and render to edittable
    updateStore(store) {
        this.setState({ editOpen: true, current: store, loading: true, createOpen: false, errorServer: false })
    }

    //update current store or create new store
    saveStore(store) {
        if (store.name.length == 0 || store.address.length == 0) {
            this.setState({ errorUser: true });
        }
        if (store.name && store.address) {
            if (store.name.match(/^[A-Za-z\s]*$/)) {
            fetch('/api/stores', {
                method: 'post',
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify(store)
            })
                .then((res) => {
                    if (!res.ok) {
                        if ((res.status == 500)) {
                            this.setState({ errorMessage: 'Store Already Avaialable!' })
                            this.userMessageHandler("#error-message");
                            console.error("Store already available to update/add!");
                        }

                    } else {
                        if (store.id > 0) {
                            this.setState({ successMessage: 'Store Details Successfully Updated!' });
                            this.userMessageHandler("#success-message");
                        } else {
                            this.setState({ successMessage: 'Store Details Successfully Created!' });
                            this.userMessageHandler("#success-message");
                        }
                    }
                    return res.json();
                })
                .then((data) => {
                    this.setState({ loading: true, editOpen: false, createOpen: true })
                    this.populateStoreData(this.state.currentPage);
                })
                .catch(error => {
                    this.setState({ errorServer: true })
                    console.error(
                        'Could not connect to the server for update/add store request' + '' +
                        error.message
                    );
                });
        } else {
            console.error("Number or special charactors found in store name!");
            this.setState({ errorUser: true });
        }
    }
    }
    //request to delete a store 
    deleteStoreRequest(store) {
        this.setState({ current: store, deleteOpen: true, loading: true, createOpen: true, errorServer: false })
    }

    //if confirmed by user then delete the store
    deleteStore(store) {
        fetch('/api/stores/' + store.id, {
            method: 'DELETE',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(store)
        })

            .then(res => {
                if (res.ok) {

                    this.setState({ successMessage: 'Store Deleted Successfully!', loading: true, editOpen: false, createOpen: true, deleteOpen: false })
                    this.populateStoreData(this.state.currentPage);
                    this.userMessageHandler("#success-message");
                }
                else {
                    if ((res.status == 404)) {
                        this.setState({ errorMessage: 'Store already been deleted!' })
                        this.userMessageHandler("#error-message");
                        this.cancelPopup();
                        throw error('Store has been already deleted');
                    } else if ((res.status == 500)) {
                        this.setState({ errorMessage: 'Store involved in sale cannot be deleted!' })
                        this.userMessageHandler("#error-message");
                        this.cancelPopup();
                        throw error('Store involved in sale cannot be deleted!');
                    }
                    else {
                        this.setState({ errorServer: true, editOpen: false })
                        throw error('Could not connect to the server for delete store request');
                    }
                }
            })
            .catch(error => {
                console.error(
                    error.message
                );
            });

    }

     //Empty fields for create new store
    createStore() {
        this.setState({
            createOpen: false,
            editOpen: true,
            errorUser: false,
            errorServer: false,
            loading: true,
            current: {
                storeId: 0,
                name: '',
                address: ''
            }
        })
    }

    static renderStoreTable(stores, currentStore, ctrl, editPopup, deletePopup, error) {
        return (
            <div>
                <table className='table table-striped' aria-labelledby="tabelLabel">
                    <div id="loading" className="loading">Loading Stores....</div>
                    <div id="loading-error" className="loading-error">Failed to Load Stores! check server connection.</div>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Address</th>
                            <th>Edit</th>
                            <th>Delete</th>
                        </tr>
                    </thead>
                    <tbody>
                        {stores?.map(store =>
                            <tr key={store.id}>
                                <td>{store.name}</td>
                                <td>{store.address}</td>
                                <td><button className="btn-edit" onClick={() => { ctrl.updateStore(store) }}><BsFillPencilFill /></button></td>
                                <td><button className="btn-delete" onClick={() => { ctrl.deleteStoreRequest(store) }}><BsFillTrashFill /></button></td>
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
                                    <th className="popup-title">Store Details</th>
                                </tr>
                                {ctrl.state.errorServer
                                    ? <div className="error">Server Connection failed!</div> : ""}
                            </thead>
                            <tbody>
                                <tr key={currentStore.id}>
                                    <td>
                                        <p> <input type="hidden" value={currentStore.id} name="storeId" /></p>
                                        <p><label> Store Name : </label>
                                        <input type="text" placeholder="Store Name" defaultValue={currentStore.name} contentEditable name="name" onChange={(event) => { currentStore.name = event.target.value; }} />
                                            {error && currentStore.name.length <= 0
                                                ? <label className="error">Name cannot be empty* </label> : ""}
                                            {error && currentStore.name.length >= 0 && !currentStore.name.match(/^[A-Za-z\s]*$/)
                                                ? <label className="error">Name cannot contains numbers or Special Charactors* </label> : ""}
                                            </p>
                                            <p><label> Store Address : </label>
                                        <input type="text" placeholder="Store Address" defaultValue={currentStore.address} name="address" onChange={(event) => { currentStore.address = event.target.value; }} />
                                            {error && currentStore.address.length <= 0 ?
                                                <label className="error">Address Cannot be empty*</label> : ""}
                                        </p>
                                        <div className="btn-submit">
                                            <button onClick={() => { ctrl.saveStore(currentStore) }}>Save</button>
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
                                    <th className="delete-confirm">Do you want to delete store : {currentStore.name}</th>

                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><div className="delete-btn-submit">
                                        <td><button onClick={() => { ctrl.deleteStore(currentStore) }}>Yes</button></td>
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
            ? StoreList.renderStoreTable(this.state.stores, this.state.current, this, this.state.editOpen, this.state.deleteOpen, this.state.errorUser)
            : StoreList.pagination();


        return (
            <div>
                <div className="table-title">
                    <h3 >Store Details</h3></div>
                {<div>< div id="success-message" className="success-message" > {this.state.successMessage}</div >
                    <div id="error-message" className="error-message">{this.state.errorMessage}</div></div>}
                {contents}
                {this.state.createOpen ?
                    <button className="btn-create-new" onClick={() => { this.createStore() }}>Create New</button>
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
