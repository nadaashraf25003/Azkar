using BuildingBlocks.Domain;
using MediatR;

namespace BuildingBlocks.Application.CQRS;

public interface ICommand : IRequest<Result>
{
}

public interface ICommand<TResponse> : IRequest<Result<TResponse>>
{
}
