from django.db import models


class Factory(models.Model):
    name = models.CharField(max_length=200)
    site = models.CharField(max_length=200)
    area = models.FloatField()
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Zone(models.Model):
    factory = models.ForeignKey(
        Factory,
        on_delete=models.CASCADE,
        related_name="zones"
    )
    name = models.CharField(max_length=200)

    position_x = models.FloatField(default=0)
    position_y = models.FloatField(default=0)
    position_z = models.FloatField(default=0)

    width = models.FloatField(default=10)
    depth = models.FloatField(default=10)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Machine(models.Model):
    MACHINE_TYPES = [
        ("CNC", "CNC"),
        ("PRESS", "Press"),
        ("CONVEYOR", "Conveyor"),
        ("HVAC", "HVAC"),
        ("ROBOT_ARM", "Robot Arm"),
        ("COMPRESSOR", "Compressor"),
        ("WELDING", "Welding"),
        ("PACKAGING", "Packaging"),
    ]

    factory = models.ForeignKey(
        Factory,
        on_delete=models.CASCADE,
        related_name="machines"
    )

    zone = models.ForeignKey(
        Zone,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="machines"
    )

    name = models.CharField(max_length=200)

    machine_type = models.CharField(
        max_length=30,
        choices=MACHINE_TYPES
    )

    power_kw = models.FloatField()
    operating_hours = models.FloatField()
    utilization = models.FloatField()

    production_rate = models.FloatField(default=0)

    production_unit = models.CharField(
        max_length=50,
        default="units/hour"
    )

    heat_output = models.FloatField(default=0)

    emission_factor = models.FloatField(
        default=0.72
    )

    position_x = models.FloatField(default=0)
    position_y = models.FloatField(default=0)
    position_z = models.FloatField(default=0)

    rotation_x = models.FloatField(default=0)
    rotation_y = models.FloatField(default=0)
    rotation_z = models.FloatField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Connection(models.Model):
    FLOW_TYPES = [
        ("MATERIAL", "Material Flow"),
    ]

    factory = models.ForeignKey(
        Factory,
        on_delete=models.CASCADE,
        related_name="connections"
    )

    source_machine = models.ForeignKey(
        Machine,
        on_delete=models.CASCADE,
        related_name="outgoing_connections"
    )

    destination_machine = models.ForeignKey(
        Machine,
        on_delete=models.CASCADE,
        related_name="incoming_connections"
    )

    flow_type = models.CharField(
        max_length=30,
        choices=FLOW_TYPES,
        default="MATERIAL"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.source_machine} → {self.destination_machine}"


class EnergyReading(models.Model):
    machine = models.ForeignKey(
        Machine,
        on_delete=models.CASCADE,
        related_name="energy_readings"
    )

    timestamp = models.DateTimeField()

    energy_kwh = models.FloatField()
    power_kw = models.FloatField()
    operating_hours = models.FloatField()
    utilization = models.FloatField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.machine.name} - {self.timestamp}"


class MachineTelemetry(models.Model):
    machine = models.ForeignKey(
        Machine,
        on_delete=models.CASCADE,
        related_name="telemetry"
    )

    timestamp = models.DateTimeField()

    power_kw = models.FloatField()
    utilization = models.FloatField()

    operating_state = models.BooleanField(default=True)

    production_units = models.FloatField(default=0)

    temperature_c = models.FloatField(default=25)

    energy_kwh = models.FloatField()

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.machine.name} - {self.timestamp}"


class Product(models.Model):
    factory = models.ForeignKey(
        Factory,
        on_delete=models.CASCADE,
        related_name="products"
    )

    name = models.CharField(max_length=200)

    description = models.TextField(blank=True)

    target_quantity = models.FloatField(default=0)

    deadline = models.DateTimeField(
        null=True,
        blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class MachineCapability(models.Model):
    machine = models.ForeignKey(
        Machine,
        on_delete=models.CASCADE,
        related_name="capabilities"
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="machine_capabilities"
    )

    production_rate = models.FloatField(default=0)

    production_unit = models.CharField(
        max_length=50,
        default="units/hour"
    )

    efficiency = models.FloatField(default=1.0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.machine.name} → {self.product.name}"


class ProductRequirement(models.Model):
    product = models.ForeignKey(
        Product,
        on_delete=models.CASCADE,
        related_name="requirements"
    )

    machine_type = models.CharField(max_length=30)

    required_quantity = models.FloatField(default=0)

    sequence = models.PositiveIntegerField(default=1)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} - {self.machine_type}"