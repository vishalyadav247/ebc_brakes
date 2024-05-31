import React, { useState } from "react";
import { ContentHeader } from "@components";

export default function LayeredFilterData() {
  const [fields, setFields] = useState([
    { id: 1, heading: "", tag: "", isDynamic: false },
  ]);
  const [nextId, setNextId] = useState(2);

  const handleAddMore = () => {
    const newField = { id: nextId, heading: "", tag: "", isDynamic: true };
    setFields([...fields, newField]);
    setNextId(nextId + 1);
  };

  const handleDelete = (id: number) => {
    const updatedFields = fields.filter((field) => field.id !== id);
    setFields(updatedFields);
  };

  return (
    <>
      <ContentHeader title="Layered Filter Data" />
      <div className="container-fluid">
        <div className="row px-2 mb-5">
          <div className="col-lg-12">
            <h4 className="mb-3">Layered Filter Data</h4>
          </div>
          {fields.map((field) => (
            <div className="col-lg-12" key={field.id}>
              <div className="add-more-main row align-items-center border pt-4 mb-4 rounded">
                <div className="col-lg-10 mb-3">
                  <div className=" col-lg-12">
                    <div className="form-group row">
                      <label
                        htmlFor={`heading-${field.id}`}
                        className="col-lg-4 col-form-label"
                      >
                        Heading
                      </label>
                      <div className="col-lg-8">
                        <input
                          id={`heading-${field.id}`}
                          className="form-control"
                          value={field.heading}
                          onChange={(e) => {
                            const updatedFields = fields.map((f) =>
                              f.id === field.id
                                ? { ...f, heading: e.target.value }
                                : f
                            );
                            setFields(updatedFields);
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className=" col-lg-12">
                    <div className="form-group row">
                      <label
                        htmlFor={`tag-${field.id}`}
                        className="col-lg-4 col-form-label"
                      >
                        Tag
                      </label>
                      <div className="col-lg-8">
                        <textarea
                          id={`tag-${field.id}`}
                          className="form-control"
                          rows={3}
                          value={field.tag}
                          onChange={(e) => {
                            const updatedFields = fields.map((f) =>
                              f.id === field.id
                                ? { ...f, tag: e.target.value }
                                : f
                            );
                            setFields(updatedFields);
                          }}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
                {field.isDynamic && (
                  <div className="col-lg-2">
                    <div className=" col-lg-12">
                      <button
                        className="btn btn-danger mb-3"
                        onClick={() => handleDelete(field.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div className="col-lg-12">
            <button className="btn btn-dark mr-2" onClick={handleAddMore}>
              Add More
            </button>
            <button className="btn btn-success mr-2">Save</button>
          </div>
        </div>
      </div>
    </>
  );
}
