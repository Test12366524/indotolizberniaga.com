export interface Media {
    id: number;
    model_type: string;
    model_id: number;
    uuid: string;
    collection_name: string;
    name: string;
    file_name: string;
    mime_type: string;
    disk: string;
    conversions_disk: string;
    size: number;
    manipulations: any[]; // Sesuaikan tipe jika perlu
    custom_properties: any[]; // Sesuaikan tipe jika perlu
    generated_conversions: any[]; // Sesuaikan tipe jika perlu
    responsive_images: any[]; // Sesuaikan tipe jika perlu
    order_column: number;
    created_at: string;
    updated_at: string;
    original_url: string;
    preview_url: string;
}

export interface ProductDetails {
    id: number;
    sku: string;
    name: string;
    slug: string;
    status: boolean;
    buy_price: string;
    created_at: string;
    sell_price: string;
    updated_at: string;
    description: string;
    ppob_category_id: number;
}

export interface User {
    id: number;
    name: string;
    phone: string;
    email: string;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
}

export interface Product {
    id: number;
    ppob_category_id: number;
    name: string;
    slug: string;
    sku: string;
    description: string;
    buy_price: string;
    sell_price: string;
    status: boolean;
    created_at: string;
    updated_at: string;
    image: string;
    media: Media[];
}

export interface Payment {
    id: number;
    driver: string;
    payable_type: string;
    payable_id: number;
    order_id: string;
    transaction_id: string;
    payment_type: string;
    account_number: string;
    account_code: string | null;
    channel: string;
    expired_at: string;
    paid_at: string;
    amount: number;
    created_at: string;
    updated_at: string;
}

// --- Perbaikan pada Transaksi Interface ---

export interface Transaksi {
    id: number;
    user_id: number;
    ppob_product_id: number;
    reference: string;
    ref_number: number;
    order_id: string;

    // Properti baru dari response API
    product_details: ProductDetails;
    response: string | null; // Asumsi null jika tidak ada
    customer_no: string;
    customer_name: string | null;
    sn: string | null;
    amount: number;
    status: number;
    status_topup: number;
    user: User;
    product: Product;
    payment: Payment;

    payment_method?: string;
    payment_channel?: string;

    created_at: string;
    updated_at: string;
}

// --- TransaksiResponse tidak berubah, tapi disertakan untuk kelengkapan ---

export interface TransaksiResponse {
    code: number;
    message: string;
    data: {
        current_page: number;
        data: Transaksi[];
        first_page_url: string;
        from: number;
        last_page: number;
        last_page_url: string;
        links: Array<{
            url: string | null;
            label: string;
            page: number | null;
            active: boolean;
        }>;
        next_page_url: string | null;
        path: string;
        per_page: number;
        prev_page_url: string | null;
        to: number;
        total: number;
    };
}

// --- Create & Update Request tidak berubah ---

export interface CreateTransaksiRequest {
    user_id: number;
    ppob_product_id: number;
    customer_no: string;
    payment_method: string;
    payment_channel: string;
}

export interface UpdateTransaksiRequest {
    user_id: number;
    ppob_product_id: number;
    customer_no: string;
    payment_method: string;
    payment_channel: string;
}