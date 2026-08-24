import { NextRequest, NextResponse } from 'next/server';
import { initialEnrollments, initialCourses } from '@/lib/mockData';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getCurrentUser();
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { courseId, materialId } = await request.json();

    const course = initialCourses.find((c) => c.id === courseId);
    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 });
    }

    let enrollment = initialEnrollments.find(
      (e) => e.userId === session.userId && e.courseId === courseId
    );

    if (!enrollment) {
      enrollment = {
        id: `enroll-${Date.now()}`,
        userId: session.userId,
        courseId,
        status: 'ACTIVE',
        progressPercentage: 0,
        completedMaterialIds: [],
        currentMaterialId: materialId || course.materials[0]?.id,
        enrolledAt: new Date().toISOString(),
        completedAt: null,
        certificateId: null,
        certificateUrl: null,
      };
      initialEnrollments.push(enrollment);
    }

    // Add materialId to completed if not already present
    if (materialId && !enrollment.completedMaterialIds.includes(materialId)) {
      enrollment.completedMaterialIds.push(materialId);
    }

    // Compute progress percentage
    const totalMaterials = course.materials.length;
    const completedCount = enrollment.completedMaterialIds.length;
    enrollment.progressPercentage = Math.min(
      Math.round((completedCount / totalMaterials) * 1000) / 10,
      100.0
    );

    if (enrollment.progressPercentage >= 100 && !enrollment.completedAt) {
      enrollment.status = 'COMPLETED';
      enrollment.completedAt = new Date().toISOString();
      enrollment.certificateId = `CERT-${courseId.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
      enrollment.certificateUrl = `/certificates/${enrollment.certificateId}`;
    }

    return NextResponse.json({
      success: true,
      enrollment,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
