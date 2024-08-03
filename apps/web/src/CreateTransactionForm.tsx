import React from "react";
import { KaspaClient } from "@repo/kaspa";

interface Props {
  client: KaspaClient;
}

export function CreateTransactionForm(props: Props) {
  const { client } = props;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const address = formData.get("address");
    const amount = formData.get("amount");
    console.log(address, amount);
  };

  return (
    <div>
      <h2>Send transaction</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input name="address" placeholder="Address" />
        </div>
        <div>
          <input name="amount" placeholder="Amount" />
        </div>
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default CreateTransactionForm;
