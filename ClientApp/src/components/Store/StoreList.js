import React, { Component } from 'react';
import { BsFillTrashFill, BsFillPencilFill } from "react-icons/bs";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Popup} from '../Utils';
import '../Components.css';

export class StoreList extends Component {
    static displayName = StoreList.name;

    constructor(props) {
        super(props);
        this.state = { createOpen: true, editOpen: false, deleteOpen: false, current: '', stores: [], loading: true, editing: false, currentPage: 1, rowsPerPage: 5, totalStores: 0, error: false };
    }

    componentDidMount() {
        this.populateStoreData(this.state.currentPage);
    }
    //close popup window
    cancelPopup() {
        //e.preventDefault();
        this.populateStoreData(this.state.currentPage);
        this.setState({
            editOpen: false, createOpen: true, deleteOpen: false
        });
    }

    renderStores(data) {
        this.setState({ customers: data, loading: true, editOpen: false, createOpen: true });
    }


    renderPagination(data) {
        const indexOfLast = this.state.currentPage * this.state.rowsPerPage;
        const indexOfFirst = indexOfLast - this.state.rowsPerPage;
        const currentData = data.slice(indexOfFirst, indexOfLast);
        this.setState({ totalStores: data.length, stores: currentData, loading: true });
    }

    async populateStoreData(page) {
        this.setState({ currentPage: page })

        fetch('/api/stores')
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
                <p><label for="noOfStoresPerPage">Number of Customers in a page :&nbsp;</label>

                    <select name="noOfStoresPerPage" onChange={(e) => { this.noOfStoresPerPage(e.target.value) }}>
                        <option>5</option>
                        <option>10</option>
                        <option>20</option>
                        <option>50</option>
                    </select>

                    <br></br>
                    {
                        pages.map((page, index) => {
                            return <button key={index} onClick={() => { this.populateStoreData(page) }}>{page}</button>
                        })
                    }
                </p>
            </div>
        )
    }

    updateStore(store) {
        this.setState({ editOpen: true, current: store, loading: true, createOpen: false })
    }

    saveStore(store) {
        if (store.name.length == 0 || store.address.length == 0) {
            this.setState({ error: true });
        }
        if (store.name && store.address) {
            fetch('/api/stores', {
                method: 'post',
                headers: new Headers({
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }),
                body: JSON.stringify(store)
            })
                .then((res) => res.json())
                .then((data) => {
                    this.setState({ loading: true, editOpen: false, createOpen: true })
                    this.populateStoreData(this.state.currentPage);
                })
                .catch(error => {
                    console.error(
                        "There has been a problem with your fetch operation for updating Store!",
                        error
                    );
                });
        }
    }
    deleteStoreRequest(store) {
        this.setState({ current: store, deleteOpen: true, loading: true, createOpen: true })
    }

    deleteStore(store) {
        fetch('/api/stores/' + store.id, {
            method: 'DELETE',
            headers: new Headers({
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }),
            body: JSON.stringify(store)
        })

            .then(response => {
                this.setState({ loading: true, editOpen: false, createOpen: true, deleteOpen: false })
                this.populateStoreData(this.state.currentPage);
                if (!response.ok) {
                    throw new Error("Network response was not ok");
                }
            })
            .catch(error => {
                console.error(
                    "There has been a problem with your fetch operation for updating Store!",
                    error
                );
            });

    }

    createStore() {
        this.setState({
            cretaOpen: false,
            editOpen: true,
            error: false,
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
                            </thead>
                            <tbody>
                                <tr key={currentStore.id}>
                                    <td>
                                        <p> <input type="hidden" value={currentStore.id} name="storeId" /></p>
                                        <p><input type="text" placeholder="Store Name" defaultValue={currentStore.name} contentEditable name="name" onChange={(event) => { currentStore.name = event.target.value; }} />
                                            {error && currentStore.name.length <= 0 ?
                                                <label className="error">Name cannot be empty* </label> : ""}
                                        </p>
                                        <p><input type="text" placeholder="Store Address" defaultValue={currentStore.address} name="address" onChange={(event) => { currentStore.address = event.target.value; }} />
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
                                <tr>
                                    <th>Do you want to delete store : {currentStore.name}</th>

                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><div className="btn-submit">
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
            ? StoreList.renderStoreTable(this.state.stores, this.state.current, this, this.state.editOpen, this.state.deleteOpen, this.state.error)
            : StoreList.pagination();


        return (
            <div>
                <div className="table-title">
                    <h3 >Store Details</h3></div>
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
