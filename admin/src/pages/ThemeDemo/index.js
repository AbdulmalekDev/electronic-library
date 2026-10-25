import React, { useState } from "react";
import Button from "@mui/material/Button";

const ThemeDemo = () => {
    const [showModal, setShowModal] = useState(false);

    return (
        <div className="right-content">
            <div className="card shadow border-0 p-4">
                <div className="d-flex align-items-center justify-content-between mb-4">
                    <h2 className="hd pb-0 mb-0">Theme System Demonstration</h2>
                    <p className="mb-0 text-muted">Showing all elements in Light & Dark mode</p>
                </div>

                <hr />

                {/* Typography Section */}
                <div className="row mb-5">
                    <div className="col-md-6">
                        <h4>Typography (H1-H6)</h4>
                        <h1>Heading H1</h1>
                        <h2>Heading H2</h2>
                        <h3>Heading H3</h3>
                        <h4>Heading H4</h4>
                        <h5>Heading H5</h5>
                        <h6>Heading H6</h6>
                        <p className="mt-3">
                            This is a paragraph (P) demonstrating the base text color. It uses the "Open Sans" font globally.
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                        </p>
                    </div>

                    <div className="col-md-6">
                        <h4>Buttons & Actions</h4>
                        <div className="d-flex flex-wrap gap-2 mt-3">
                            <Button className="btn-blue">Primary Button</Button>
                            <Button className="btn-blue btn-lg">Large Button</Button>
                            <Button className="btn-blue btn-round">Round Button</Button>
                            <Button className="btn-blue btn-big">Big Button</Button>
                        </div>
                        <div className="d-flex flex-wrap gap-2 mt-3">
                            <button className="btn btn-primary">Bootstrap Primary</button>
                            <button className="btn btn-secondary">Bootstrap Secondary</button>
                            <button className="btn btn-success">Bootstrap Success</button>
                            <button className="btn btn-danger">Bootstrap Danger</button>
                        </div>
                    </div>
                </div>

                {/* Form Section */}
                <div className="row mb-5">
                    <div className="col-md-12">
                        <h4>Forms & Inputs</h4>
                        <div className="row mt-3">
                            <div className="col-md-4">
                                <div className="form-group mb-3">
                                    <label className="form-label">Default Input</label>
                                    <input type="text" className="form-control" placeholder="Enter text..." />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group mb-3">
                                    <label className="form-label">Select Box</label>
                                    <select className="form-control">
                                        <option>Option 1</option>
                                        <option>Option 2</option>
                                        <option>Option 3</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group mb-3">
                                    <label className="form-label">Textarea</label>
                                    <textarea className="form-control" rows="1" placeholder="Enter message..."></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="row mb-5">
                    <div className="col-md-12">
                        <h4>Tables & Data</h4>
                        <div className="table-responsive mt-3">
                            <table className="table table-bordered v-align">
                                <thead className="thead-dark">
                                    <tr>
                                        <th>ID</th>
                                        <th>Product Name</th>
                                        <th>Category</th>
                                        <th>Price</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>#1</td>
                                        <td>The Great Gatsby</td>
                                        <td>Classic Literature</td>
                                        <td>$15.00</td>
                                        <td><span className="badge bg-success">Available</span></td>
                                        <td className="actions">
                                            <Button className="success"><i className="fa fa-eye"></i></Button>
                                            <Button className="secondary"><i className="fa fa-pencil"></i></Button>
                                            <Button className="error"><i className="fa fa-trash"></i></Button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>#2</td>
                                        <td>Brave New World</td>
                                        <td>Sci-Fi</td>
                                        <td>$12.50</td>
                                        <td><span className="badge bg-danger">Out of Stock</span></td>
                                        <td className="actions">
                                            <Button className="success"><i className="fa fa-eye"></i></Button>
                                            <Button className="secondary"><i className="fa fa-pencil"></i></Button>
                                            <Button className="error"><i className="fa fa-trash"></i></Button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* UI Components */}
                <div className="row mb-5">
                    <div className="col-md-6">
                        <h4>Cards & Boxes</h4>
                        <div className="dashboardBoxWrapper d-flex mt-3">
                            <div className="dashboardBox p-3 bg-primary text-white rounded">
                                <h6>Dashboard Box</h6>
                                <h3>$1,234</h3>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <h4>Modals</h4>
                        <Button className="btn-blue mt-3" onClick={() => setShowModal(true)}>
                            Open Demonstration Modal
                        </Button>
                    </div>
                </div>
            </div>

            {/* Modal Demonstration */}
            {showModal && (
                <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow-lg border-0" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)' }}>
                            <div className="modal-header border-bottom border-color" style={{ borderColor: 'var(--border-color)' }}>
                                <h5 className="modal-title h5">Theme-Aware Modal</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)} style={{ filter: 'var(--theme-filter)' }}></button>
                            </div>
                            <div className="modal-body p-4">
                                <p>This modal automatically adapts its background and text color based on the global theme variables.</p>
                                <input type="text" className="form-control mb-3" placeholder="Theme-aware input inside modal" />
                                <div className="d-flex gap-2">
                                    <span className="badge bg-primary">Tag 1</span>
                                    <span className="badge bg-secondary">Tag 2</span>
                                </div>
                            </div>
                            <div className="modal-footer border-top border-color" style={{ borderColor: 'var(--border-color)' }}>
                                <Button className="btn-blue" onClick={() => setShowModal(false)}>Close Modal</Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeDemo;
