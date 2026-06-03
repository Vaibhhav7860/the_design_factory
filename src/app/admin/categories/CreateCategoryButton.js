"use client";

import { useState } from "react";
import { HiPlus } from "react-icons/hi";
import styles from "./categories.module.css";
import CreateCategoryModal from "./CreateCategoryModal";

export default function CreateCategoryButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button 
        className={styles.createCategoryBtn}
        onClick={() => setIsOpen(true)}
      >
        <HiPlus /> Create Category
      </button>

      {isOpen && (
        <CreateCategoryModal onClose={() => setIsOpen(false)} />
      )}
    </>
  );
}
