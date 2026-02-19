"use client";

import { useEffect, useState } from "react";
import { AsyncPaginate } from "react-select-async-paginate";
import type { GroupBase, OptionsOrGroups } from "react-select";
import { Label } from "@/components/ui/label";

export interface PaginatedAsyncMultiSelectProps<T> {
  value?: (string | number)[];
  onChange: (value: (string | number)[]) => void;
  fetcher: (params: {
    page: number;
    limit: number;
    search?: string;
  }) => Promise<
    | {
        data: T[];
        meta?: {
          total_pages?: number;
          last_page?: number;
          [key: string]: any;
        };
      }
    | T[]
  >;
  preloadFetcher?: (ids: (string | number)[]) => Promise<T[]>;
  getOptionLabel: (item: T) => string;
  getOptionValue: (item: T) => string | number;
  label?: string;
  placeholder?: string;
  staticOptions?: { value: string | number; label: string }[];
  excludeIds?: (string | number)[];
}

export function PaginatedAsyncMultiSelect<T>({
  value = [],
  onChange,
  fetcher,
  preloadFetcher,
  getOptionLabel,
  getOptionValue,
  label,
  placeholder = "Search...",
  staticOptions = [],
  excludeIds = [],
}: PaginatedAsyncMultiSelectProps<T>) {
  const [selectedOptions, setSelectedOptions] = useState<
    { value: string | number; label: string }[]
  >([]);

  const loadOptions = async (
    search: string,
    loadedOptions: OptionsOrGroups<
      { value: string | number; label: string },
      GroupBase<{ value: string | number; label: string }>
    >,
    additional?: { page: number },
  ) => {
    const page = additional?.page || 1;
    const limit = 10;

    try {
      const response = await fetcher({
        page,
        limit,
        search: search || undefined,
      });

      let items: T[] = [];
      let hasMore = false;
      let totalPages = 0;

      if (Array.isArray(response)) {
        items = response;
        hasMore = false;
      } else {
        items = response.data;
        const meta = response.meta;
        if (meta && (meta.total_pages || meta.last_page)) {
          totalPages = meta.total_pages || meta.last_page || 0;
          hasMore = page < totalPages;
        } else {
          hasMore = items.length === limit;
        }
      }

      const filteredItems = items.filter(
        (item) => !excludeIds.includes(getOptionValue(item)),
      );

      const options = filteredItems.map((item) => ({
        value: getOptionValue(item),
        label: getOptionLabel(item),
      }));

      const finalOptions =
        page === 1 && !search ? [...staticOptions, ...options] : options;

      return {
        options: finalOptions,
        hasMore,
        additional: {
          page: page + 1,
        },
      };
    } catch (error) {
      console.error("Error loading options:", error);
      return {
        options: [],
        hasMore: false,
        additional: {
          page: page,
        },
      };
    }
  };

  useEffect(() => {
    if (value.length > 0 && selectedOptions.length === 0 && preloadFetcher) {
      // Logic to preload selected options could be complex if APIs don't support batch get
      // Assuming preloadFetcher handles it, or we iterate if we must (less efficient)
      // For now, let's assume valid array logic or implementing basic preloader
      preloadFetcher(value)
        .then((items) => {
          if (items) {
            const options = items.map((item) => ({
              value: getOptionValue(item),
              label: getOptionLabel(item),
            }));
            setSelectedOptions(options);
          }
        })
        .catch((err) => {
          console.error("Failed to load selected items", err);
        });
    } else if (value.length === 0 && selectedOptions.length > 0) {
      setSelectedOptions([]);
    }
    // If value changes from outside (e.g. reset), we need to handle it.
    // But identifying *which* changed is hard without full objects.
    // Relying on internal state for now mostly.
  }, [value, preloadFetcher, getOptionValue, getOptionLabel]);

  const handleChange = (newValue: any) => {
    const options = newValue as { value: string | number; label: string }[];
    setSelectedOptions(options);
    onChange(options.map((o) => o.value));
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <AsyncPaginate
        isMulti
        debounceTimeout={300}
        value={selectedOptions}
        loadOptions={loadOptions}
        onChange={handleChange}
        placeholder={placeholder}
        isClearable
        additional={{
          page: 1,
        }}
        styles={{
          control: (base) => ({
            ...base,
            minHeight: "36px",
            fontSize: "0.875rem",
            borderColor: "hsl(var(--input))",
            backgroundColor: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            "&:hover": {
              borderColor: "hsl(var(--input))",
            },
          }),
          menu: (base) => ({
            ...base,
            zIndex: 50,
            backgroundColor: "hsl(var(--popover))",
            borderColor: "hsl(var(--border))",
          }),
          option: (base, state) => ({
            ...base,
            fontSize: "0.875rem",
            padding: "6px 8px",
            cursor: "pointer",
            backgroundColor: state.isFocused
              ? "hsl(var(--accent))"
              : "transparent",
            color: state.isFocused
              ? "hsl(var(--accent-foreground))"
              : "hsl(var(--popover-foreground))",
            "&:active": {
              backgroundColor: "hsl(var(--accent))",
            },
          }),
          multiValue: (base) => ({
            ...base,
            backgroundColor: "hsl(var(--secondary))",
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: "hsl(var(--secondary-foreground))",
          }),
          multiValueRemove: (base) => ({
            ...base,
            color: "hsl(var(--secondary-foreground))",
            ":hover": {
              backgroundColor: "hsl(var(--destructive))",
              color: "hsl(var(--destructive-foreground))",
            },
          }),
          input: (base) => ({
            ...base,
            color: "hsl(var(--foreground))",
          }),
        }}
        classNames={{
          control: () =>
            "!min-h-9 !border-input !bg-background hover:!bg-background hover:!border-input",
          menu: () =>
            "!bg-popover !border !border-border !rounded-md !shadow-md",
        }}
      />
    </div>
  );
}
