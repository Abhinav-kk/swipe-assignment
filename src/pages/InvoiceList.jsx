import React, { useState } from "react";
import { Button, Card, Col, Row, Table } from "react-bootstrap";
import { Link } from "react-router-dom";
import { BiSolidPencil, BiTrash } from "react-icons/bi";
import { BsEyeFill } from "react-icons/bs";
import InvoiceModal from "../components/InvoiceModal";
import { useNavigate } from "react-router-dom";
import { useInvoiceListData } from "../redux/hooks";
import { useDispatch } from "react-redux";
import { deleteInvoice, updateInvoice, updateInvoices } from "../redux/invoicesSlice";
import Form from "react-bootstrap/Form";

const InvoiceList = () => {
  const { invoiceList, getOneInvoice } = useInvoiceListData();
  const isListEmpty = invoiceList.length === 0;
  const dispatch = useDispatch();
  const [copyId, setCopyId] = useState("");
  const [editableInvoices, setEditableInvoices] = useState({});
  const [updatedFields, setUpdatedFields] = useState({});

  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const navigate = useNavigate();
  const handleCopyClick = () => {
    const invoice = getOneInvoice(copyId);
    if (!invoice) {
      alert("Please enter the valid invoice id.");
    } else {
      navigate(`/create/${copyId}`);
    }
  };
  const [isSelectMode, setIsSelectMode] = useState(true);

  const toggleSelectInvoice = (invoiceId) => {
    const newSelectedInvoices = [...selectedInvoices];

    if (newSelectedInvoices.includes(invoiceId)) {
      const { [invoiceId]: _, ...rest } = editableInvoices;
      setEditableInvoices(rest);
      newSelectedInvoices.splice(newSelectedInvoices.indexOf(invoiceId), 1);
    } else {
      newSelectedInvoices.push(invoiceId);
      setEditableInvoices({ ...editableInvoices, [invoiceId]: true });
    }

    setSelectedInvoices(newSelectedInvoices);
  };

  const handleBulkEdit = () => {
    console.log("Selected Invoices: ", selectedInvoices);
    setBulkEditMode(!bulkEditMode);
    setIsSelectMode(false);

  };

  const handleSaveBulkEdit = () => {
    const updatedInvoices = invoiceList.map((invoice) => {
      if (editableInvoices[invoice.id]) {
        return {
          ...invoice,
          invoiceNumber: invoice.invoiceNumber,
        };
      }
      return invoice;
    });

    dispatch(updateInvoices(updatedInvoices));

    setBulkEditMode(false);
  };

  const handleCancelBulkEdit = () => {
    setBulkEditMode(false);
  };
  console.log("editableInvoices", editableInvoices);

  const updateInvoiceField = (invoiceId, field, value) => {
    setEditableInvoices((prev) => ({
      ...prev,
      [invoiceId]: true,
    }));

    setUpdatedFields((prev) => ({
      ...prev,
      [invoiceId]: {
        ...prev[invoiceId],
        [field]: value,
      },
    }));
  }

  return (
    <Row>
      <Col className="mx-auto" xs={12} md={8} lg={9}>
        <h3 className="fw-bold pb-2 pb-md-4 text-center">Swipe Assignment</h3>
        <Card className="d-flex p-3 p-md-4 my-3 my-md-4 ">
          {isListEmpty ? (
            <div className="d-flex flex-column align-items-center">
              <h3 className="fw-bold pb-2 pb-md-4">No invoices present</h3>
              <Link to="/create">
                <Button variant="primary">Create Invoice</Button>
              </Link>
            </div>
          ) : (
            <div className="d-flex flex-column">
              <div className="d-flex flex-row align-items-center justify-content-between">
                <h3 className="fw-bold pb-2 pb-md-4">Invoice List</h3>

                <Link to="/create">
                  <Button variant="primary mb-2 mb-md-4">Create Invoice</Button>
                </Link>
                <Button variant="secondary mb-2 mb-md-4" onClick={handleBulkEdit}>Bulk Edit</Button>
                <div className="d-flex gap-2">
                  <Button variant="dark mb-2 mb-md-4" onClick={handleCopyClick}>
                    Copy Invoice
                  </Button>

                  <input
                    type="text"
                    value={copyId}
                    onChange={(e) => setCopyId(e.target.value)}
                    placeholder="Enter Invoice ID to copy"
                    className="bg-white border"
                    style={{
                      height: "50px",
                    }}
                  />
                </div>
              </div>
              <Table responsive>
                <thead>
                  <tr>
                    <th></th>
                    <th>Invoice No.</th>
                    <th>Bill To</th>
                    <th>Due Date</th>
                    <th>Total Amt.</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceList.map((invoice) => (
                    <InvoiceRow
                      key={invoice.id}
                      invoice={invoice}
                      navigate={navigate}
                      isSelected={selectedInvoices.includes(invoice.id)}
                      toggleSelect={toggleSelectInvoice}
                      bulkEditMode={bulkEditMode}
                      editableInvoices={editableInvoices}
                      isSelectMode={isSelectMode}
                      updateInvoiceField={updateInvoiceField}
                      updatedFields={updatedFields}
                    />
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Card>
      </Col>
      <div className="fw-bold pb-2 pb-md-4 text-center">
        {bulkEditMode ? (
          <>
            <Button variant="success" onClick={handleSaveBulkEdit} style={{ marginRight: 10 }}>
              Save Changes
            </Button>
            <Button variant="danger" onClick={handleCancelBulkEdit}>
              Cancel
            </Button>
          </>
        ) : null}
      </div>
      <h4 className="fw-bold pb-2 pb-md-4 text-center">Updated By Abhinav K.K</h4>
    </Row>
  );
};

const InvoiceRow = ({ invoice, navigate, isSelected, toggleSelect, bulkEditMode, editableInvoices, isSelectMode, updateInvoiceField }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();

  const handleDeleteClick = (invoiceId) => {
    dispatch(deleteInvoice(invoiceId));
  };

  const handleEditClick = () => {
    navigate(`/edit/${invoice.id}`);
  };

  const openModal = (event) => {
    event.preventDefault();
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const isEditable = bulkEditMode && editableInvoices[invoice.id];
  console.log("isEditable: ", isEditable, bulkEditMode && editableInvoices);
  var newInvoice = { ...invoice };

  const handleInvoiceNumberChange = (e) => {
    newInvoice.invoiceNumber = e.target.value;
    dispatch(updateInvoice({ id: newInvoice.id, updatedInvoice: newInvoice }));
  };

  const handleBillToChange = (e) => {
    newInvoice.billTo = e.target.value;
    dispatch(updateInvoice({ id: newInvoice.id, updatedInvoice: newInvoice }));
  };

  const handleDateChange = (e) => {
    newInvoice.dateOfIssue = e.target.value;
    dispatch(updateInvoice({ id: newInvoice.id, updatedInvoice: newInvoice }));
  };

  const handleTotalChange = (e) => {
    newInvoice.total = e.target.value;
    newInvoice.subTotal = e.target.value;
    dispatch(updateInvoice({ id: newInvoice.id, updatedInvoice: newInvoice }));
  };


  return (
    <tr>
      <td>
        {!bulkEditMode && (
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSelect(invoice.id)}
          />)}
      </td>
      <td>
        {isEditable ? (
          <input
            type="text"
            defaultValue={invoice.invoiceNumber}
            onChange={handleInvoiceNumberChange}
          />
        ) : (
          invoice.invoiceNumber
        )}
      </td>
      <td className="fw-normal">
        {isEditable ? (
          <input
            type="text"
            defaultValue={invoice.billTo}
            onChange={handleBillToChange}
          />
        ) : (
          invoice.billTo
        )}
      </td>
      <td className="fw-normal">
        {isEditable ? (
          <Form.Control
            type="date"
            defaultValue={invoice.dateOfIssue}
            name="dateOfIssue"
            onChange={handleDateChange}
            style={{ maxWidth: "150px" }}
            required
          />

        ) : (
          invoice.dateOfIssue
        )}
      </td>
      <td className="fw-normal">
        {invoice.currency}
        {isEditable ? (
          <input
            type="text"
            defaultValue={invoice.total}
            onChange={handleTotalChange}
            style={{ width: "70%", marginLeft: "10px" }}
          />
        ) : (
          invoice.total
        )}
      </td>

      <td style={{ width: "5%" }}>
        <Button variant="outline-primary" onClick={handleEditClick}>
          <div className="d-flex align-items-center justify-content-center gap-2">
            <BiSolidPencil />
          </div>
        </Button>
      </td>
      <td style={{ width: "5%" }}>
        <Button variant="danger" onClick={() => handleDeleteClick(invoice.id)}>
          <div className="d-flex align-items-center justify-content-center gap-2">
            <BiTrash />
          </div>
        </Button>
      </td>
      <td style={{ width: "5%" }}>
        <Button variant="secondary" onClick={openModal}>
          <div className="d-flex align-items-center justify-content-center gap-2">
            <BsEyeFill />
          </div>
        </Button>
      </td>
      <InvoiceModal
        showModal={isOpen}
        closeModal={closeModal}
        info={{
          isOpen,
          id: invoice.id,
          currency: invoice.currency,
          currentDate: invoice.currentDate,
          invoiceNumber: invoice.invoiceNumber,
          dateOfIssue: invoice.dateOfIssue,
          billTo: invoice.billTo,
          billToEmail: invoice.billToEmail,
          billToAddress: invoice.billToAddress,
          billFrom: invoice.billFrom,
          billFromEmail: invoice.billFromEmail,
          billFromAddress: invoice.billFromAddress,
          notes: invoice.notes,
          total: invoice.total,
          subTotal: invoice.subTotal,
          taxRate: invoice.taxRate,
          taxAmount: invoice.taxAmount,
          discountRate: invoice.discountRate,
          discountAmount: invoice.discountAmount,
        }}
        items={invoice.items}
        currency={invoice.currency}
        subTotal={invoice.subTotal}
        taxAmount={invoice.taxAmount}
        discountAmount={invoice.discountAmount}
        total={invoice.total}
      />
    </tr>
  );
};

export default InvoiceList;
