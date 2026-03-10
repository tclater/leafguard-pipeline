"""
Seed script: populate the database with initial stage data and sample customers.
Run with: docker compose run --rm backend python -m app.seed
"""
import random
from app.database import SessionLocal
from app.models import Stage, Automation, Customer


STAGES = [
    {
        "id": "new-customer",
        "name": "New Customer",
        "color": "bg-blue-500",
        "velocity": 2.3,
        "conversion_rate": 78,
        "avg_time_in_stage": 4.2,
        "stagnant": 23,
        "sort_order": 1,
        "automations": [
            {
                "icon": "Mail",
                "name": "Send Welcome Email",
                "trigger": "On entry",
                "action_type": "email",
                "description": "Welcome new customers with intro email",
            },
            {
                "icon": "Clock",
                "name": "Set Follow-up Task",
                "trigger": "On entry",
                "action_type": "task",
                "description": "Create task for rep to follow up",
            },
        ],
    },
    {
        "id": "appt-booked",
        "name": "Appt Booked",
        "color": "bg-purple-500",
        "velocity": 18.5,
        "conversion_rate": 85,
        "avg_time_in_stage": 12.8,
        "stagnant": 15,
        "sort_order": 2,
        "automations": [
            {
                "icon": "MessageSquare",
                "name": "SMS Confirmation",
                "trigger": "On entry",
                "action_type": "sms",
                "description": "Send SMS to confirm appointment",
            },
            {
                "icon": "Calendar",
                "name": "Add to Calendar",
                "trigger": "On entry",
                "action_type": "calendar",
                "description": "Add appointment to rep calendar",
            },
        ],
    },
    {
        "id": "validated",
        "name": "Validated",
        "color": "bg-green-500",
        "velocity": 1.8,
        "conversion_rate": 92,
        "avg_time_in_stage": 2.1,
        "stagnant": 8,
        "sort_order": 3,
        "automations": [
            {
                "icon": "Phone",
                "name": "Send to TPV",
                "trigger": "On entry",
                "action_type": "integration",
                "description": "Submit data to TPV system",
            },
        ],
    },
    {
        "id": "appt-confirmed",
        "name": "Appt Confirmed",
        "color": "bg-teal-500",
        "velocity": 8.4,
        "conversion_rate": 88,
        "avg_time_in_stage": 6.2,
        "stagnant": 5,
        "sort_order": 4,
        "automations": [
            {
                "icon": "MessageSquare",
                "name": "SMS Day Before",
                "trigger": "24 hours before",
                "action_type": "sms",
                "description": "SMS reminder 24hrs before",
            },
        ],
    },
    {
        "id": "appt-complete",
        "name": "Appt Complete",
        "color": "bg-orange-500",
        "velocity": 24.6,
        "conversion_rate": 65,
        "avg_time_in_stage": 18.3,
        "stagnant": 12,
        "sort_order": 5,
        "automations": [
            {
                "icon": "Mail",
                "name": "Thank You Email",
                "trigger": "On entry",
                "action_type": "email",
                "description": "Send thank you email to customer",
            },
        ],
    },
    {
        "id": "closed",
        "name": "Closed Won",
        "color": "bg-emerald-600",
        "velocity": 0,
        "conversion_rate": 100,
        "avg_time_in_stage": 0,
        "stagnant": 0,
        "sort_order": 6,
        "automations": [
            {
                "icon": "Mail",
                "name": "Welcome Package",
                "trigger": "On entry",
                "action_type": "email",
                "description": "Send welcome package info",
            },
        ],
    },
]

NAMES = [
    "John Smith", "Sarah Williams", "Michael Brown", "Jennifer Davis",
    "Robert Johnson", "Lisa Anderson", "David Martinez", "Emily Garcia",
    "James Wilson", "Maria Rodriguez",
]
COMPANIES = ["Residence", "Home", "Property", "Estate"]
REPS = [
    "Mike Johnson", "Tom Jones", "Rachel Davis",
    "Steve Miller", "Amy Wilson", "Kevin Thomas",
]
PRIORITIES = ["high", "medium", "low"]
STAGE_IDS = [
    "new-customer", "appt-booked", "validated",
    "appt-confirmed", "appt-complete", "closed",
]


def seed():
    db = SessionLocal()
    try:
        # Skip if already seeded
        if db.query(Stage).count() > 0:
            print("Database already seeded — skipping.")
            return

        print("Seeding stages and automations...")
        for stage_data in STAGES:
            automations_data = stage_data.pop("automations")
            stage = Stage(**stage_data)
            db.add(stage)
            db.flush()

            for auto_data in automations_data:
                auto = Automation(stage_id=stage.id, **auto_data)
                db.add(auto)

        print("Seeding 350 sample customers...")
        for i in range(350):
            customer = Customer(
                name=f"{NAMES[i % len(NAMES)].split()[0]} {NAMES[i % len(NAMES)].split()[1]} {i}",
                company=f"{NAMES[i % len(NAMES)].split()[1]} {COMPANIES[i % len(COMPANIES)]}",
                value=round(4000 + random.random() * 4000, 2),
                stage_id=STAGE_IDS[i % len(STAGE_IDS)],
                rep=REPS[i % len(REPS)],
                last_contact=f"{random.randint(1, 7)}d ago",
                hours_in_stage=random.randint(0, 120),
                priority=PRIORITIES[i % len(PRIORITIES)],
            )
            db.add(customer)

        db.commit()
        print("Seed complete.")
    except Exception as exc:
        db.rollback()
        raise exc
    finally:
        db.close()


if __name__ == "__main__":
    seed()
