"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { attributeService } from "../attribute.service";
import { useAttributeValues } from "../hooks/use-attribute-values";
import { AttributeValueTable } from "../components/attribute-value-table";
import { AttributeValueForm } from "../components/attribute-value-form";
import { TAttributeValue } from "../attribute-value.types";

export default function AttributeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingValue, setEditingValue] = useState<TAttributeValue | null>(
    null,
  );

  // Fetch Attribute Details
  const {
    data: attribute,
    isLoading: isAttributeLoading,
    error: attributeError,
  } = useQuery({
    queryKey: ["attribute", id],
    queryFn: () => attributeService.getAttribute(id),
  });

  // Fetch Attribute Values
  const {
    attributeValuesData,
    isLoading: isValuesLoading,
    createMutation,
    updateMutation,
    deleteMutation,
    toggleStatusMutation,
  } = useAttributeValues({ attribute_id: id });

  const handleCreate = () => {
    setEditingValue(null);
    setIsFormOpen(true);
  };

  const handleEdit = (value: TAttributeValue) => {
    setEditingValue(value);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (data: any) => {
    if (editingValue) {
      await updateMutation.mutateAsync({
        id: editingValue.id,
        data: { ...data },
      });
    } else {
      await createMutation.mutateAsync({
        ...data,
        attribute_id: id,
      });
    }
    setIsFormOpen(false);
  };

  if (isAttributeLoading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (attributeError || !attribute) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 space-y-4">
        <p className="text-destructive">Failed to load attribute details</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  const valuesList = Array.isArray(attributeValuesData)
    ? attributeValuesData
    : (attributeValuesData as any)?.data || [];

  return (
    <div className="flex flex-col h-full w-full p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {attribute.name}
          </h1>
          <p className="text-muted-foreground mt-1">
            Type:{" "}
            <span className="capitalize font-medium text-foreground">
              {attribute.data_type}
            </span>
          </p>
        </div>
      </div>

      <Separator />

      {/* Values Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle>Attribute Values</CardTitle>
            <CardDescription>
              Manage available values for this attribute
            </CardDescription>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Add Value
          </Button>
        </CardHeader>
        <CardContent className="pt-6">
          {isValuesLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin" />
            </div>
          ) : valuesList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No values found</p>
              <Button onClick={handleCreate} variant="outline" className="mt-4">
                <Plus className="mr-2 h-4 w-4" />
                Add your first value
              </Button>
            </div>
          ) : (
            <AttributeValueTable
              data={valuesList}
              onEdit={handleEdit}
              onDelete={(valueId) => deleteMutation.mutate(valueId)}
              onToggleStatus={(valueId, status) =>
                toggleStatusMutation.mutate({ id: valueId, isActive: !status })
              }
            />
          )}
        </CardContent>
      </Card>

      <AttributeValueForm
        open={isFormOpen}
        onOpenChange={(open) => {
          setIsFormOpen(open);
          if (!open) setEditingValue(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingValue}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </div>
  );
}
