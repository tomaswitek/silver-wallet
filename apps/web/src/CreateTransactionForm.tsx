import React from "react";
import { KaspaClient } from "@repo/kaspa";

interface Props {
  client: KaspaClient;
}

export function CreateTransactionForm(props: Props) {
  const { client } = props;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const address = formData.get("address");
    const amount = formData.get("amount");
    if (address && amount) {
      await client.sendTransaction(address.toString(), amount.toString());
    }
  };

  return (
    <div>
      <h2>Send transaction</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            name="address"
            placeholder="Address"
            defaultValue={
              "kaspa:qpwsd47u5jvhpewtswnwka0m0zelt5gy0gly4lqcgvc46wfgzf78yh3087alj"
            }
          />
        </div>
        <div>
          <input name="amount" placeholder="Amount" defaultValue="0.2" />
        </div>
        <button type="submit">Send</button>
      </form>
    </div>
  );
}

export default CreateTransactionForm;
