from rest_framework import serializers

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


class FactorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Factory
        fields = "__all__"


class ZoneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Zone
        fields = "__all__"


class MachineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Machine
        fields = "__all__"


class ConnectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Connection
        fields = "__all__"


class EnergyReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = EnergyReading
        fields = "__all__"


class MachineTelemetrySerializer(serializers.ModelSerializer):
    class Meta:
        model = MachineTelemetry
        fields = "__all__"


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = "__all__"


class MachineCapabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = MachineCapability
        fields = "__all__"


class ProductRequirementSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductRequirement
        fields = "__all__"