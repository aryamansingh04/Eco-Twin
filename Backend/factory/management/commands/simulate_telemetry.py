import random
import time

from django.core.management.base import BaseCommand
from django.utils import timezone

from factory.models import (
    Machine,
    MachineTelemetry
)


class Command(BaseCommand):
    help = "Simulate realistic machine telemetry"

    def handle(self, *args, **options):
        self.stdout.write(
            self.style.SUCCESS(
                "Starting realistic machine telemetry simulation..."
            )
        )

        while True:
            machines = Machine.objects.all()

            if not machines.exists():
                self.stdout.write(
                    self.style.WARNING(
                        "No machines found."
                    )
                )

                time.sleep(5)
                continue

            for machine in machines:
                operating = random.random() > 0.05

                if not operating:
                    utilization = 0
                    power = 0
                    production_units = 0
                    temperature = 25
                else:
                    utilization = random.uniform(
                        0.45,
                        0.95
                    )

                    power = (
                        machine.power_kw *
                        utilization
                    )

                    power *= random.uniform(
                        0.95,
                        1.05
                    )

                    production_rate = (
                        machine.production_rate
                    )

                    production_units = (
                        production_rate *
                        utilization /
                        60
                    )

                    production_units *= random.uniform(
                        0.90,
                        1.10
                    )

                    temperature = (
                        25 +
                        utilization * 30 +
                        random.uniform(-2, 2)
                    )

                energy = power / 60

                MachineTelemetry.objects.create(
                    machine=machine,

                    timestamp=timezone.now(),

                    power_kw=round(
                        power,
                        2
                    ),

                    utilization=round(
                        utilization,
                        2
                    ),

                    operating_state=operating,

                    production_units=round(
                        production_units,
                        2
                    ),

                    temperature_c=round(
                        temperature,
                        2
                    ),

                    energy_kwh=round(
                        energy,
                        4
                    )
                )

                state = (
                    "ON"
                    if operating
                    else "OFF"
                )

                self.stdout.write(
                    f"{machine.name} | "
                    f"{state} | "
                    f"{power:.2f} kW | "
                    f"{utilization:.0%} | "
                    f"{production_units:.2f} units"
                )

            self.stdout.write("-" * 70)

            time.sleep(5)