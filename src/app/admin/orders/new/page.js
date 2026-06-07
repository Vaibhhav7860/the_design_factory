import PageHeader from "@/components/admin/PageHeader";
import { Button } from "@/components/admin/Button";
import { HiOutlineArrowLeft } from "react-icons/hi";
import CreateOrderForm from "./CreateOrderForm";

export const metadata = { title: "Create order · Admin" };
export const dynamic = "force-dynamic";

export default function NewOrderPage() {
  return (
    <div>
      <PageHeader
        eyebrow="Order management"
        title="Create order"
        description="Manually create an order. It is saved straight to the Orders collection."
        actions={
          <Button variant="secondary" href="/admin/orders" iconLeft={<HiOutlineArrowLeft />}>
            Back to orders
          </Button>
        }
      />
      <CreateOrderForm />
    </div>
  );
}
