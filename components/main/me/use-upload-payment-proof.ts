"use client";

import { useState } from "react";

/** Hook kecil untuk upload bukti pembayaran (tetap sama, tapi tanpa any) */
export default function useUploadPaymentProofMutation() {
  const [isLoading, setIsLoading] = useState(false);

  const uploadPaymentProof = async (
    transactionId: string,
    file: File
  ): Promise<unknown> => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append("payment_proof", file);
      formData.append("_method", "PUT");

      const response = await fetch(
        `https://cms.yameiyashop.com/api/v1/public/transaction/${transactionId}/manual?_method=PUT`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload payment proof");
      }
      return await response.json();
    } finally {
      setIsLoading(false);
    }
  };

  return { uploadPaymentProof, isLoading };
}