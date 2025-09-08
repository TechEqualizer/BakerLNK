-- Enable Row Level Security and create policies
-- This migration sets up proper security policies for all tables

-- Enable RLS on all tables
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Themes policies (public read access)
CREATE POLICY "Anyone can view themes"
    ON public.themes FOR SELECT
    USING (true);

-- Bakers policies (users can manage their own baker profile)
CREATE POLICY "Anyone can view bakers"
    ON public.bakers FOR SELECT
    USING (true);

CREATE POLICY "Users can create their baker profile"
    ON public.bakers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their baker profile"
    ON public.bakers FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their baker profile"
    ON public.bakers FOR DELETE
    USING (auth.uid() = user_id);

-- Customers policies (bakers can manage their customers)
CREATE POLICY "Bakers can view their customers"
    ON public.customers FOR SELECT
    USING (
        baker_id IN (
            SELECT id FROM public.bakers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Bakers can create customers"
    ON public.customers FOR INSERT
    WITH CHECK (
        baker_id IN (
            SELECT id FROM public.bakers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Bakers can update their customers"
    ON public.customers FOR UPDATE
    USING (
        baker_id IN (
            SELECT id FROM public.bakers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Bakers can delete their customers"
    ON public.customers FOR DELETE
    USING (
        baker_id IN (
            SELECT id FROM public.bakers WHERE user_id = auth.uid()
        )
    );

-- Orders policies (bakers can manage their orders)
CREATE POLICY "Bakers can view their orders"
    ON public.orders FOR SELECT
    USING (
        baker_id IN (
            SELECT id FROM public.bakers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Bakers can create orders"
    ON public.orders FOR INSERT
    WITH CHECK (
        baker_id IN (
            SELECT id FROM public.bakers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Bakers can update their orders"
    ON public.orders FOR UPDATE
    USING (
        baker_id IN (
            SELECT id FROM public.bakers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Bakers can delete their orders"
    ON public.orders FOR DELETE
    USING (
        baker_id IN (
            SELECT id FROM public.bakers WHERE user_id = auth.uid()
        )
    );

-- Gallery policies (public read, bakers manage their own)
CREATE POLICY "Anyone can view gallery items"
    ON public.gallery FOR SELECT
    USING (true);

CREATE POLICY "Bakers can create gallery items"
    ON public.gallery FOR INSERT
    WITH CHECK (
        baker_id IN (
            SELECT id FROM public.bakers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Bakers can update their gallery items"
    ON public.gallery FOR UPDATE
    USING (
        baker_id IN (
            SELECT id FROM public.bakers WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Bakers can delete their gallery items"
    ON public.gallery FOR DELETE
    USING (
        baker_id IN (
            SELECT id FROM public.bakers WHERE user_id = auth.uid()
        )
    );

-- Messages policies (participants can see their conversations)
CREATE POLICY "Users can view their messages"
    ON public.messages FOR SELECT
    USING (
        baker_id IN (
            SELECT id FROM public.bakers WHERE user_id = auth.uid()
        ) OR
        customer_id IN (
            SELECT id FROM public.customers 
            WHERE baker_id IN (
                SELECT id FROM public.bakers WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can create messages"
    ON public.messages FOR INSERT
    WITH CHECK (
        baker_id IN (
            SELECT id FROM public.bakers WHERE user_id = auth.uid()
        ) OR
        customer_id IN (
            SELECT id FROM public.customers 
            WHERE baker_id IN (
                SELECT id FROM public.bakers WHERE user_id = auth.uid()
            )
        )
    );

CREATE POLICY "Users can update their messages"
    ON public.messages FOR UPDATE
    USING (
        baker_id IN (
            SELECT id FROM public.bakers WHERE user_id = auth.uid()
        ) OR
        customer_id IN (
            SELECT id FROM public.customers 
            WHERE baker_id IN (
                SELECT id FROM public.bakers WHERE user_id = auth.uid()
            )
        )
    );

-- Gallery inquiries policies (users manage their own)
CREATE POLICY "Users can view their gallery inquiries"
    ON public.gallery_inquiries FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create gallery inquiries"
    ON public.gallery_inquiries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their gallery inquiries"
    ON public.gallery_inquiries FOR DELETE
    USING (auth.uid() = user_id);

-- Files policies (users manage their uploads)
CREATE POLICY "Users can view their files"
    ON public.files FOR SELECT
    USING (auth.uid() = uploaded_by);

CREATE POLICY "Users can create files"
    ON public.files FOR INSERT
    WITH CHECK (auth.uid() = uploaded_by);

CREATE POLICY "Users can delete their files"
    ON public.files FOR DELETE
    USING (auth.uid() = uploaded_by);