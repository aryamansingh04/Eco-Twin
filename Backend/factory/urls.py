from rest_framework.routers import DefaultRouter
from django.urls import path

from .views import (
    FactoryViewSet,
    ZoneViewSet,
    MachineViewSet,
    ConnectionViewSet,
    EnergyReadingViewSet,
    MachineTelemetryViewSet,
    ProductViewSet,
    MachineCapabilityViewSet,
    ProductRequirementViewSet,
    MachineStatusView,
    FactoryAnalyticsView,
    MachineAnalyticsView,
    FactoryHistoricalAnalyticsView
)


router = DefaultRouter()

router.register(
    "factories",
    FactoryViewSet
)

router.register(
    "zones",
    ZoneViewSet
)

router.register(
    "machines",
    MachineViewSet
)

router.register(
    "connections",
    ConnectionViewSet
)

router.register(
    "energy-readings",
    EnergyReadingViewSet
)

router.register(
    "machine-telemetry",
    MachineTelemetryViewSet
)

router.register(
    "products",
    ProductViewSet
)

router.register(
    "machine-capabilities",
    MachineCapabilityViewSet
)

router.register(
    "product-requirements",
    ProductRequirementViewSet
)


urlpatterns = [
    path(
        "machine-status/",
        MachineStatusView.as_view()
    ),

    path(
        "analytics/factory/<int:factory_id>/",
        FactoryAnalyticsView.as_view()
    ),

    path(
        "analytics/factory/<int:factory_id>/machines/",
        MachineAnalyticsView.as_view()
    ),

    path(
        "analytics/factory/<int:factory_id>/history/",
        FactoryHistoricalAnalyticsView.as_view()
    )
] + router.urls