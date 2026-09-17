from django.db.models import (
    OuterRef,
    Subquery,
    Sum,
    Avg,
    Max
)

from django.utils import timezone

from rest_framework import viewsets
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import (
    Factory,
    Zone,
    Machine,
    Connection,
    EnergyReading,
    MachineTelemetry,
    Product,
    MachineCapability,
    ProductRequirement
)

from .serializers import (
    FactorySerializer,
    ZoneSerializer,
    MachineSerializer,
    ConnectionSerializer,
    EnergyReadingSerializer,
    MachineTelemetrySerializer,
    ProductSerializer,
    MachineCapabilitySerializer,
    ProductRequirementSerializer
)


class FactoryViewSet(viewsets.ModelViewSet):
    queryset = Factory.objects.all()
    serializer_class = FactorySerializer


class ZoneViewSet(viewsets.ModelViewSet):
    queryset = Zone.objects.all()
    serializer_class = ZoneSerializer


class MachineViewSet(viewsets.ModelViewSet):
    queryset = Machine.objects.all()
    serializer_class = MachineSerializer


class ConnectionViewSet(viewsets.ModelViewSet):
    queryset = Connection.objects.all()
    serializer_class = ConnectionSerializer


class EnergyReadingViewSet(viewsets.ModelViewSet):
    queryset = EnergyReading.objects.all()
    serializer_class = EnergyReadingSerializer


class MachineTelemetryViewSet(viewsets.ModelViewSet):
    queryset = MachineTelemetry.objects.all()
    serializer_class = MachineTelemetrySerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer


class MachineCapabilityViewSet(viewsets.ModelViewSet):
    queryset = MachineCapability.objects.all()
    serializer_class = MachineCapabilitySerializer


class ProductRequirementViewSet(viewsets.ModelViewSet):
    queryset = ProductRequirement.objects.all()
    serializer_class = ProductRequirementSerializer


class MachineStatusView(APIView):
    def get(self, request):
        latest_telemetry = MachineTelemetry.objects.filter(
            machine=OuterRef("pk")
        ).order_by("-timestamp")

        machines = Machine.objects.annotate(
            latest_status=Subquery(
                latest_telemetry.values("operating_state")[:1]
            ),
            latest_power=Subquery(
                latest_telemetry.values("power_kw")[:1]
            ),
            latest_utilization=Subquery(
                latest_telemetry.values("utilization")[:1]
            ),
            latest_production=Subquery(
                latest_telemetry.values("production_units")[:1]
            ),
            latest_temperature=Subquery(
                latest_telemetry.values("temperature_c")[:1]
            ),
            latest_timestamp=Subquery(
                latest_telemetry.values("timestamp")[:1]
            )
        )

        data = []

        for machine in machines:
            if machine.latest_status is True:
                status = "ON"
            elif machine.latest_status is False:
                status = "OFF"
            else:
                status = "NO_DATA"

            data.append({
                "machine_id": machine.id,
                "machine_name": machine.name,
                "machine_type": machine.machine_type,
                "status": status,
                "power_kw": machine.latest_power,
                "utilization": machine.latest_utilization,
                "production_units": machine.latest_production,
                "temperature_c": machine.latest_temperature,
                "timestamp": machine.latest_timestamp
            })

        return Response(data)


class FactoryAnalyticsView(APIView):
    def get(self, request, factory_id):
        machines = Machine.objects.filter(
            factory_id=factory_id
        )

        telemetry = MachineTelemetry.objects.filter(
            machine__factory_id=factory_id
        )

        running_machines = 0
        offline_machines = 0
        no_data_machines = 0

        for machine in machines:
            latest = MachineTelemetry.objects.filter(
                machine=machine
            ).order_by("-timestamp").first()

            if latest is None:
                no_data_machines += 1
            elif latest.operating_state:
                running_machines += 1
            else:
                offline_machines += 1

        current_power = 0

        for machine in machines:
            latest = MachineTelemetry.objects.filter(
                machine=machine
            ).order_by("-timestamp").first()

            if latest:
                current_power += latest.power_kw

        now = timezone.now()

        start_of_day = now.replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0
        )

        today_telemetry = telemetry.filter(
            timestamp__gte=start_of_day
        )

        energy_today = today_telemetry.aggregate(
            total=Sum("energy_kwh")
        )["total"] or 0

        production_today = today_telemetry.aggregate(
            total=Sum("production_units")
        )["total"] or 0

        average_utilization = today_telemetry.aggregate(
            average=Avg("utilization")
        )["average"] or 0

        peak_power = today_telemetry.aggregate(
            peak=Max("power_kw")
        )["peak"] or 0

        carbon_today = 0

        for reading in today_telemetry:
            carbon_today += (
                reading.energy_kwh *
                reading.machine.emission_factor
            )

        if production_today > 0:
            carbon_intensity = (
                carbon_today /
                production_today
            )
        else:
            carbon_intensity = 0

        return Response({
            "factory_id": factory_id,

            "machines": {
                "total": machines.count(),
                "running": running_machines,
                "offline": offline_machines,
                "no_data": no_data_machines
            },

            "energy": {
                "current_power_kw": round(
                    current_power,
                    2
                ),
                "energy_today_kwh": round(
                    energy_today,
                    2
                ),
                "peak_power_kw": round(
                    peak_power,
                    2
                )
            },

            "production": {
                "production_today": round(
                    production_today,
                    2
                ),
                "average_utilization": round(
                    average_utilization,
                    2
                )
            },

            "carbon": {
                "carbon_today_kg": round(
                    carbon_today,
                    2
                ),
                "carbon_intensity_kg_per_unit": round(
                    carbon_intensity,
                    4
                )
            }
        })


class MachineAnalyticsView(APIView):
    def get(self, request, factory_id):
        machines = Machine.objects.filter(
            factory_id=factory_id
        )

        now = timezone.now()

        start_of_day = now.replace(
            hour=0,
            minute=0,
            second=0,
            microsecond=0
        )

        data = []

        for machine in machines:
            telemetry = MachineTelemetry.objects.filter(
                machine=machine,
                timestamp__gte=start_of_day
            )

            latest = MachineTelemetry.objects.filter(
                machine=machine
            ).order_by("-timestamp").first()

            energy_today = telemetry.aggregate(
                total=Sum("energy_kwh")
            )["total"] or 0

            production_today = telemetry.aggregate(
                total=Sum("production_units")
            )["total"] or 0

            average_utilization = telemetry.aggregate(
                average=Avg("utilization")
            )["average"] or 0

            peak_power = telemetry.aggregate(
                peak=Max("power_kw")
            )["peak"] or 0

            carbon_today = (
                energy_today *
                machine.emission_factor
            )

            if production_today > 0:
                energy_per_unit = (
                    energy_today /
                    production_today
                )

                carbon_per_unit = (
                    carbon_today /
                    production_today
                )
            else:
                energy_per_unit = 0
                carbon_per_unit = 0

            if latest is None:
                status = "NO_DATA"
            elif latest.operating_state:
                status = "ON"
            else:
                status = "OFF"

            data.append({
                "machine_id": machine.id,
                "machine_name": machine.name,
                "machine_type": machine.machine_type,
                "status": status,

                "power_kw": (
                    latest.power_kw
                    if latest else 0
                ),

                "energy_today_kwh": round(
                    energy_today,
                    2
                ),

                "carbon_today_kg": round(
                    carbon_today,
                    2
                ),

                "production_today": round(
                    production_today,
                    2
                ),

                "average_utilization": round(
                    average_utilization,
                    2
                ),

                "peak_power_kw": round(
                    peak_power,
                    2
                ),

                "energy_per_unit": round(
                    energy_per_unit,
                    4
                ),

                "carbon_per_unit": round(
                    carbon_per_unit,
                    4
                ),

                "production_rate": (
                    machine.production_rate
                ),

                "production_unit": (
                    machine.production_unit
                )
            })

        return Response(data)


class FactoryHistoricalAnalyticsView(APIView):
    def get(self, request, factory_id):
        telemetry = MachineTelemetry.objects.filter(
            machine__factory_id=factory_id
        ).order_by("timestamp")

        data = []

        for reading in telemetry:
            carbon = (
                reading.energy_kwh *
                reading.machine.emission_factor
            )

            data.append({
                "timestamp": reading.timestamp,

                "machine_id": reading.machine.id,

                "machine_name": reading.machine.name,

                "power_kw": reading.power_kw,

                "energy_kwh": reading.energy_kwh,

                "utilization": reading.utilization,

                "production_units": (
                    reading.production_units
                ),

                "temperature_c": (
                    reading.temperature_c
                ),

                "operating_state": (
                    reading.operating_state
                ),

                "carbon_kg": round(
                    carbon,
                    4
                )
            })

        return Response(data)