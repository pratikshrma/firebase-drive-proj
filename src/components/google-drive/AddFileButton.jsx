import React, { useState } from "react";
import { ReactDOM } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileUpload } from "@fortawesome/free-solid-svg-icons";
import { storage, database } from "../../firebase";
import { useAuth } from "../../contexts/AuthContext";
import { ROOT_FOLDER } from "../hooks/useFolder";
import { nanoid } from "nanoid";

const AddFileButton = ({ currentFolder }) => {
    const { currentUser } = useAuth();
    // console.log(currentUser.uid);
    function handleUpload(e) {
        const file = e.target.files[0];
        if (currentFolder == null || file == null) return;
        console.log(currentFolder);

        var parentPath = "";
        if (currentFolder.path.length > 0) {
            parentPath = `${currentFolder.path
                .map((path) => path.name)
                .join("/")}`;
        }
        // const parentPath =
        //     currentFolder.path.length > 1
        //         ? `${currentFolder.path.map((path) => path.name).join("/")}`
        //         : file.name;
        console.log(parentPath);
        const filePath =
            currentFolder === ROOT_FOLDER
                ? parentPath
                : `${parentPath}/${currentFolder.name}/${file.name}`;
        console.log(filePath);
        const uploadTask = storage
            .ref(`/files/${currentUser.uid}/${filePath}`)
            .put(file);

        uploadTask.on(
            "state-changed",
            (snapshot) => {},
            () => {},
            () => {
                uploadTask.snapshot.ref.getDownloadURL().then((url) => {
                    database.files
                        .where("name", "==", file.name)
                        .where("userId", "==", currentUser.uid)
                        .where("folderId", "==", currentFolder.id)
                        .get()
                        .then((existingFiles) => {
                            const existingFile = existingFiles.docs[0];
                            if (existingFile) {
                                existingFile.ref.update({ url: url });
                            } else {
                                database.files.add({
                                    url: url,
                                    name: file.name,
                                    createdAt: database.getCurrentTimeStamp(),
                                    folderId: currentFolder.id,
                                    userId: currentUser.uid,
                                });
                            }
                        });
                    console.log(url);
                });
            }
        );
    }

    return (
        <>
            <label className="btn btn-outline-success m-2 ">
                <FontAwesomeIcon icon={faFileUpload}></FontAwesomeIcon>
                <input
                    type="file"
                    onChange={handleUpload}
                    style={{
                        opacity: 0,
                        position: "absolute",
                        left: "-9999px",
                    }}
                />
            </label>
        </>
    );
};

export default AddFileButton;
