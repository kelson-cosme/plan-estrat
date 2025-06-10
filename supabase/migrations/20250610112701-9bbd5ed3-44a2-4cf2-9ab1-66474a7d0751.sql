
-- Create a table to track the next scheduled dates for maintenance plans
CREATE TABLE public.maintenance_plan_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  maintenance_plan_id UUID REFERENCES public.maintenance_plans(id) ON DELETE CASCADE NOT NULL,
  next_scheduled_date DATE NOT NULL,
  last_generated_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security
ALTER TABLE public.maintenance_plan_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies for the schedules table
CREATE POLICY "Allow all operations on maintenance_plan_schedules" 
  ON public.maintenance_plan_schedules 
  FOR ALL 
  USING (true);

-- Create a function to generate work orders from maintenance plans
CREATE OR REPLACE FUNCTION public.generate_scheduled_work_orders()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  plan_record RECORD;
  schedule_record RECORD;
  next_date DATE;
BEGIN
  -- Loop through all active maintenance plans that have schedules due
  FOR schedule_record IN 
    SELECT mps.*, mp.name, mp.type, mp.description, mp.tasks, mp.priority, 
           mp.equipment_id, mp.estimated_duration_hours, mp.frequency_days
    FROM maintenance_plan_schedules mps
    JOIN maintenance_plans mp ON mps.maintenance_plan_id = mp.id
    WHERE mp.active = true 
    AND mps.next_scheduled_date <= CURRENT_DATE
  LOOP
    -- Create work order for this scheduled maintenance
    INSERT INTO work_orders (
      title,
      type,
      description,
      priority,
      status,
      equipment_id,
      maintenance_plan_id,
      scheduled_date,
      estimated_hours
    ) VALUES (
      'Agendamento Automático: ' || schedule_record.name,
      schedule_record.type,
      COALESCE(schedule_record.description, schedule_record.tasks, 'Manutenção agendada automaticamente'),
      schedule_record.priority,
      'open',
      schedule_record.equipment_id,
      schedule_record.maintenance_plan_id,
      schedule_record.next_scheduled_date,
      schedule_record.estimated_duration_hours
    );
    
    -- Calculate next scheduled date based on frequency
    IF schedule_record.frequency_days IS NOT NULL THEN
      next_date := schedule_record.next_scheduled_date + INTERVAL '1 day' * schedule_record.frequency_days;
      
      -- Update the schedule with the next date
      UPDATE maintenance_plan_schedules 
      SET 
        next_scheduled_date = next_date,
        last_generated_date = schedule_record.next_scheduled_date,
        updated_at = now()
      WHERE id = schedule_record.id;
    END IF;
  END LOOP;
END;
$$;

-- Create a function to initialize schedules for existing plans
CREATE OR REPLACE FUNCTION public.initialize_maintenance_schedules()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
  plan_record RECORD;
  start_date DATE;
BEGIN
  -- Initialize schedules for active plans that don't have schedules yet
  FOR plan_record IN 
    SELECT mp.*
    FROM maintenance_plans mp
    LEFT JOIN maintenance_plan_schedules mps ON mp.id = mps.maintenance_plan_id
    WHERE mp.active = true 
    AND mp.frequency_days IS NOT NULL
    AND mps.id IS NULL
  LOOP
    -- Start scheduling from tomorrow
    start_date := CURRENT_DATE + INTERVAL '1 day';
    
    -- Insert initial schedule
    INSERT INTO maintenance_plan_schedules (
      maintenance_plan_id,
      next_scheduled_date
    ) VALUES (
      plan_record.id,
      start_date
    );
  END LOOP;
END;
$$;
